import { CONFIG } from "../../../Config/Config";
import Drawer from "../../../Helper/Drawer";
import { callFloatingText } from "../../../Helper/FloatingText";
import { GlobalVar } from "../../../Helper/GlobalVar";
import Utils from "../../../Helper/Utils";
import { callTextNotification, TextNotificationBGColor } from "../../../Notification/TextNotification";
import GardenBackground, { GARDEN_BG_EVENTS } from "../../GardenBackground";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Item";
import MainCtrl from "../../MainCtrl";
import { GLOBAL_EVENTS } from "../../System/GlobalEvent";
import UIController from "../../UI/UIController";
import GardenAssetManager from "../GardenAssetManager";
import Plant from "../Plant";
import Slot, { SLOT_STATE } from "../Slot";
import SlotManager from "../SlotManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotInteractionUIManager extends cc.Component {
   public static ins: SlotInteractionUIManager = null;

   @property(cc.Node) uiContainer: cc.Node = null;
   @property(cc.Prefab) potSelectionMenuPref: cc.Prefab = null;
   @property(cc.Prefab) potSelectionItemPref: cc.Prefab = null;

   @property(cc.Prefab) seedSelectionMenuPref: cc.Prefab = null;
   @property(cc.Prefab) seedSelectionItemPref: cc.Prefab = null;
   @property(cc.Prefab) harvestHandPref: cc.Prefab = null;

   @property(cc.Node) harvestHandIcon: cc.Node = null;

   currentMenu: cc.Node = null;
   currentItems: cc.Node[] = [];

   onInteractSlotOverride = null;

   protected onLoad(): void {
      SlotInteractionUIManager.ins = this;
   }

   onSlotInteract(slot: Slot) {
      const isSpectating = UIController.ins.getIsSpectating();
      if (isSpectating) return;

      if (this.onInteractSlotOverride) return this.onInteractSlotOverride(slot);

      switch (slot.state) {
         case SLOT_STATE.EMPTY:
            // console.log(`ONLICK EMPTY SLOT:`, slot.slotData);
            this.showPotSelectionUI(slot);
            break;
         case SLOT_STATE.OCCUPIED:
            // console.log(`ONLICK OCCUPIED SLOT:`, slot.slotData);
            Utils.mushroomBounceNode(slot.node);
            this.showSeedSelectionUI(slot);
            break;
         case SLOT_STATE.PLANTED:
            // console.log(`ONLICK PLANTED SLOT:`, slot.slotData);
            this.onClickPlant(slot);
            break;
      }
   }

   showPotSelectionUI(slot: Slot) {
      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);

      let menu = cc.instantiate(this.potSelectionMenuPref);

      menu.setParent(this.uiContainer);
      let localizedPos = Utils.worldSpaceToLocal(Utils.getWorldPos(slot.node), menu.parent);

      localizedPos.x -= 51.25;
      localizedPos.y += menu.height;
      localizedPos.y += 50;

      menu.setPosition(localizedPos);
      this.currentMenu = menu;

      const userInventory = GlobalVar.inventory;
      const items = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      if (!userInventory) throw new Error(`userInventory is undefined.`);

      const clearMenu = () => {
         Utils.fadeOutNode(menu, 0.2, null, true);
         GardenBackground.eventInstance.off(GARDEN_BG_EVENTS.CLICK_END, clearMenu, this);
         cc.systemEvent.off(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, clearMenu, this);
      };

      GardenBackground.eventInstance.on(GARDEN_BG_EVENTS.CLICK_END, clearMenu, this);
      cc.systemEvent.on(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, clearMenu, this);

      if (!userInventory.pot) throw new Error(`pot is undefined or empty.`)

      this.currentItems = [];
      let potItems = Object.keys(userInventory.pot);
      potItems = potItems.sort((a, b) => { return userInventory.pot[b] - userInventory.pot[a]; });
      potItems.forEach(itemID => {
         let itemCount = userInventory?.pot[itemID];
         const item = items[itemID];
         const sprFrame = GardenAssetManager.ins.potSprFrames[item.spriteIndex];

         let selectionItem = cc.instantiate(this.potSelectionItemPref);
         selectionItem.setParent(menu);
         selectionItem.setPosition(0, 0);

         const lb = selectionItem.getComponentInChildren(cc.Label);

         let selectionItemIcon = new cc.Node();
         selectionItemIcon.setParent(selectionItem);
         selectionItemIcon.setPosition(0, 0);
         selectionItemIcon.anchorY = 0.5;
         this.currentItems.push(selectionItemIcon);

         let spr = selectionItemIcon.addComponent(cc.Sprite);
         spr.spriteFrame = sprFrame;

         selectionItemIcon.scale = 0.55;
         lb.string = `x${itemCount}`;
         lb.node.setSiblingIndex(lb.node.parent.children.length);

         if (itemCount <= 0) return;

         let targetPos: cc.Vec2 = null;
         let movedFromOrigin = false;
         const minDistanceToStartDragging = 35;

         selectionItemIcon.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent: cc.Event.EventTouch) => {
            const touchPos = touchEvent.getLocation();
            const originPos = Utils.getWorldPos(selectionItem);
            const distantFromOrigin = cc.Vec2.distance(originPos, touchPos);
            if (!movedFromOrigin && distantFromOrigin < minDistanceToStartDragging) return;
            if (lb.node.parent != selectionItemIcon) {
               lb.node.setParent(selectionItemIcon);
               lb.node.scale = 1 / selectionItemIcon.scale;
            }

            movedFromOrigin = true;
            targetPos = Utils.worldSpaceToLocal(touchPos, selectionItemIcon.parent);
         });

         const escapeAndClearAll = () => {
            selectionItemIcon.off(cc.Node.EventType.TOUCH_MOVE);
            selectionItemIcon.off(cc.Node.EventType.TOUCH_END);
            if (updateFollow) this.unschedule(updateFollow);
            clearMenu();
         }

         const handleCollision = (collidedSlot: Slot) => {
            SlotManager.ins.addPotToSlot(item, collidedSlot);

            itemCount--;
            lb.string = `x${itemCount}`;

            if (itemCount <= 0) return escapeAndClearAll();
         }

         const calculateAndHandleCollision = () => {
            let slots = SlotManager.ins.gardenSlots;
            let itemBox = selectionItemIcon.getBoundingBoxToWorld();

            for (const slot of slots) {
               if (!slot || !slot.interactable) continue;
               let slotBox = slot.node.getBoundingBoxToWorld();
               slotBox = Utils.scaleRect(slotBox, 0.5);

               if (slot.state != SLOT_STATE.EMPTY) continue;
               if (slotBox.intersects(itemBox)) return handleCollision(slot);
            }
         }

         const updateFollow = () => {
            if (!targetPos) return;
            if (itemCount <= 0) return;
            if (!selectionItemIcon) return escapeAndClearAll();


            try {
               const currentPos = selectionItemIcon.getPosition();
               const newPos = currentPos.lerp(targetPos, 0.2);
               selectionItemIcon.setPosition(newPos);

               if (!movedFromOrigin) return;
               calculateAndHandleCollision();
            } catch (error) { escapeAndClearAll(); }
         };

         this.schedule(updateFollow, 0);

         selectionItemIcon.on(cc.Node.EventType.TOUCH_END, (touchEvent: cc.Event.EventTouch) => {
            const touchPos = touchEvent.getLocation();
            const originPos = Utils.getWorldPos(selectionItem);
            const distantFromOrigin = cc.Vec2.distance(originPos, touchPos);

            this.unschedule(updateFollow);

            if (movedFromOrigin || distantFromOrigin >= minDistanceToStartDragging) { return escapeAndClearAll(); }

            if (itemCount <= 0) return;

            itemCount -= 1;
            SlotManager.ins.addPotToSlot(item, slot);

            return escapeAndClearAll();
         });
      });
   }

   showSeedSelectionUI(slot: Slot) {
      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);

      let menu = cc.instantiate(this.seedSelectionMenuPref);

      menu.setParent(this.uiContainer);
      let localizedPos = Utils.worldSpaceToLocal(Utils.getWorldPos(slot.node), menu.parent);

      localizedPos.x -= 51.25;
      localizedPos.y += menu.height;
      localizedPos.y += 100;

      menu.setPosition(localizedPos);

      const userInventory = GlobalVar.inventory;
      const items = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      if (!userInventory) throw new Error(`userInventory is undefined.`);

      const clearMenu = () => {
         Utils.fadeOutNode(menu, 0.2, null, true);
         GardenBackground.eventInstance.off(GARDEN_BG_EVENTS.CLICK_END, clearMenu, this);
         cc.systemEvent.off(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, clearMenu, this);
      };

      GardenBackground.eventInstance.on(GARDEN_BG_EVENTS.CLICK_END, clearMenu, this);
      cc.systemEvent.on(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, clearMenu, this);

      if (!userInventory.seed) throw new Error(`seed is undefined.`);

      this.currentItems = [];
      let seedItems = Object.keys(userInventory.seed);
      seedItems = seedItems.sort((a, b) => { return userInventory.seed[b] - userInventory.seed[a]; });
      seedItems.forEach(itemID => {
         let itemCount = userInventory.seed[itemID];
         const item = items[itemID];

         const sprFrame = GardenAssetManager.ins.plantMaturedSprFrames[item.spriteIndex];
         let selectionItem = cc.instantiate(this.seedSelectionItemPref);
         selectionItem.setParent(menu);
         selectionItem.setPosition(0, 0);

         const lb = selectionItem.getComponentInChildren(cc.Label);

         let selectionItemIcon = new cc.Node();
         selectionItemIcon.setParent(selectionItem);
         selectionItemIcon.setPosition(0, 0);
         selectionItemIcon.anchorY = 0.5;

         this.currentItems.push(selectionItemIcon);
         let spr = selectionItemIcon.addComponent(cc.Sprite);
         spr.spriteFrame = sprFrame;

         selectionItemIcon.scale = 0.55;
         lb.string = `x${itemCount}`;
         lb.node.setSiblingIndex(lb.node.parent.children.length);

         if (itemCount <= 0) return;

         let targetPos: cc.Vec2 = null;
         let movedFromOrigin = false;
         const minDistanceToStartDragging = 35;

         selectionItemIcon.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent: cc.Event.EventTouch) => {
            const touchPos = touchEvent.getLocation();
            const originPos = Utils.getWorldPos(selectionItem);
            const distantFromOrigin = cc.Vec2.distance(originPos, touchPos);
            if (!movedFromOrigin && distantFromOrigin < minDistanceToStartDragging) return;
            if (lb.node.parent != selectionItemIcon) {
               lb.node.setParent(selectionItemIcon);
               lb.node.setPosition(cc.v2(lb.node.position).multiplyScalar(1 / 0.55));
               lb.node.scale = 1 / selectionItemIcon.scale;
            }

            movedFromOrigin = true;
            targetPos = Utils.worldSpaceToLocal(touchPos, selectionItemIcon.parent);
         });

         const escapeAndClearAll = () => {
            selectionItemIcon.off(cc.Node.EventType.TOUCH_MOVE);
            selectionItemIcon.off(cc.Node.EventType.TOUCH_END);
            if (updateFollow) this.unschedule(updateFollow);
            clearMenu();
         }

         const handleCollision = (collidedSlot: Slot) => {
            SlotManager.ins.plantSeedToSlot(item, collidedSlot);

            itemCount--;
            lb.string = `x${itemCount}`;

            if (itemCount <= 0) return escapeAndClearAll();
         }

         const calculateAndHandleCollision = () => {
            let slots = SlotManager.ins.gardenSlots;
            let itemBox = selectionItemIcon.getBoundingBoxToWorld();

            for (const slot of slots) {
               if (!slot || !slot.interactable) continue;
               let slotBox = slot.node.getBoundingBoxToWorld();
               slotBox = Utils.scaleRect(slotBox, 0.5);

               if (slot.state != SLOT_STATE.OCCUPIED) continue;
               if (slotBox.intersects(itemBox)) return handleCollision(slot);
            }
         }

         const updateFollow = () => {
            if (!targetPos) return;
            if (itemCount <= 0) return;
            if (!selectionItemIcon) return escapeAndClearAll();

            try {
               const currentPos = selectionItemIcon.getPosition();
               const newPos = currentPos.lerp(targetPos, 0.2);
               selectionItemIcon.setPosition(newPos);

               if (!movedFromOrigin) return;
               calculateAndHandleCollision();
            } catch (error) { escapeAndClearAll(); }
         };

         this.schedule(updateFollow, 0);

         selectionItemIcon.on(cc.Node.EventType.TOUCH_END, (touchEvent: cc.Event.EventTouch) => {
            const touchPos = touchEvent.getLocation();
            const originPos = Utils.getWorldPos(selectionItem);
            const distantFromOrigin = cc.Vec2.distance(originPos, touchPos);

            this.unschedule(updateFollow);

            if (movedFromOrigin || distantFromOrigin >= minDistanceToStartDragging) { return escapeAndClearAll(); }
            if (itemCount <= 0) return;

            itemCount -= 1;
            SlotManager.ins.plantSeedToSlot(item, slot);

            return escapeAndClearAll();
         });
      });
   }

   onClickPlant(slot: Slot) {
      let plant = slot.plant;

      const isSpectating = UIController.ins.getIsSpectating();
      if (isSpectating) return;

      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);

      if (plant.isReadyToHarvest()) {
         SlotManager.ins.harvestPlant(plant);
         Utils.mushroomBounceNode(plant.node);
      } else if (plant.hasBug()) {
         SlotManager.ins.catchBug(plant);
         Utils.mushroomBounceNode(plant.node);
      } else if (plant.isWaterable()) {
         SlotManager.ins.waterPlant(plant);
         Utils.mushroomBounceNode(plant.node);
      }
   }

   protected onDestroy(): void {
      SlotInteractionUIManager.ins = null;
   }
}