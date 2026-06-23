import { ITEM_TYPE } from "../../Config/Constant";
import { GlobalVar } from "../../Helper/GlobalVar";
import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";
import GardenAssetManager from "../../Main/Farming/GardenAssetManager";
import Plant from "../../Main/Farming/Plant";
import Slot, { SLOT_STATE } from "../../Main/Farming/Slot";
import SlotInteractionUIManager from "../../Main/Farming/SlotInteractionUI/SlotInteractionUIManager";
import SlotManager from "../../Main/Farming/SlotManager";
import GardenBackground, { GARDEN_BG_EVENTS } from "../../Main/GardenBackground";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Main/Item";
import { GLOBAL_EVENTS } from "../../Main/System/GlobalEvent";
import ItemCard from "./ItemCard";

const { ccclass, property } = cc._decorator;

enum INVENTORY_PAGE {
   SEED = 0,
   POT = 1,
   FERTILIZER = 2,
}
@ccclass
export default class InventoryBar extends cc.Component {
   public static ins: InventoryBar = null;

   @property(cc.Node) itemContainer: cc.Node = null;

   @property(cc.Prefab) itemCardPref: cc.Prefab = null;
   @property(cc.Prefab) itemCardIconPref: cc.Prefab = null;

   @property([cc.Node]) tabBtns: cc.Node[] = [];

   blockAllAction = false;
   currentPage: INVENTORY_PAGE = null;
   currentSelectingItemCard: ItemCard = null;
   currentItems: ItemCard[] = null;

   protected onLoad(): void {
      InventoryBar.ins = this;

      this.currentPage = INVENTORY_PAGE.SEED;
      this.scheduleOnce(this.reloadInventory);
   }

   reloadInventory() {
      this.tabBtns.forEach((btn, i) => {
         btn.opacity = (i === this.currentPage) ? 255 : 150;
         btn.getComponent(cc.Button).interactable = (i !== this.currentPage);
      });

      this.itemContainer.removeAllChildren(true);

      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      const inventory = GlobalVar.inventory;

      const pageMap = {
         [INVENTORY_PAGE.SEED]: { items: inventory.seed, frames: GardenAssetManager.ins.plantMaturedSprFrames },
         [INVENTORY_PAGE.POT]: { items: inventory.pot, frames: GardenAssetManager.ins.potSprFrames },
         [INVENTORY_PAGE.FERTILIZER]: { items: inventory.fertilizer, frames: GardenAssetManager.ins.fertilizerSprFrames }
      };

      const pageData = pageMap[this.currentPage];
      if (!pageData || !pageData.items) return;
      const sortedIDs = Object.keys(pageData.items).sort((a, b) => pageData.items[b] - pageData.items[a]);

      this.currentItems = [];
      sortedIDs.forEach(itemID => {
         const itemCount = pageData.items[itemID];
         const item = ITEMS[itemID];
         const itemCard = cc.instantiate(this.itemCardPref);

         itemCard.setParent(this.itemContainer);
         itemCard.setPosition(0, 0);

         const itemCardScript = itemCard.getComponent(ItemCard);
         itemCardScript.countLb.string = `x${itemCount}`;
         itemCardScript.iconSprs.forEach(spr => { spr.spriteFrame = pageData.frames[item.spriteIndex]; });
         itemCardScript.itemData = { itemID: itemID, itemType: item.itemType, count: itemCount, }

         itemCardScript.updateAvailabilityState();
         this.registerAndHandleClickAndDraggingEventsForItemCard(itemCardScript);

         this.currentItems.push(itemCardScript);
      });


   }

   registerAndHandleClickAndDraggingEventsForItemCard(itemCard: ItemCard) {
      const lb = itemCard.countLb.node

      const iconOriginParent = itemCard.icon.parent, iconOriginPos = itemCard.icon.position, iconOriginScale = itemCard.icon.scale;
      const lbOriginParent = lb.parent, lbOriginPos = lb.position, lbOriginScale = lb.scale;

      let targetPos: cc.Vec2 = null;
      let icon: cc.Node = itemCard.icon;
      let movedFromOrigin = false, blockAll = false, dragging = false;

      const canvas = AssetContainer.ins.canvas;
      const lbPos = cc.v2(20.206, -18.71);

      const startDrag = () => {
         if (dragging) throw new Error(`Dragging already.`);

         const iconWPosBeforeTransition = Utils.getWorldPos(itemCard.node);

         icon.setParent(canvas);
         icon.scale = 1.45;
         lb.setParent(icon);
         lb.setPosition(lbPos);

         icon.position = cc.v3(Utils.worldSpaceToLocal(iconWPosBeforeTransition, canvas));
         targetPos = cc.v2(icon.position);
         this.scheduleOnce(() => { this.schedule(updateFollow, 0); }, 0.05);

         dragging = true;
         movedFromOrigin = true;
      }

      const resetDragging = () => {
         if (!dragging) return;

         targetPos = null;
         movedFromOrigin = false;
         blockAll = false;

         icon.setParent(iconOriginParent);
         icon.setPosition(iconOriginPos);
         icon.scale = iconOriginScale;

         lb.setParent(lbOriginParent);
         lb.setPosition(lbOriginPos);
         lb.scale = lbOriginScale;

         this.unschedule(updateFollow);

         dragging = false;
         GardenBackground.eventInstance.off(GARDEN_BG_EVENTS.CLICK_END, resetDragging, this);
      };

      const updateFollow = () => {
         if (!targetPos || !dragging || !movedFromOrigin) return;

         try {
            const currentPos = icon.getPosition();
            const newPos = currentPos.lerp(targetPos, 0.33);
            icon.setPosition(newPos);

            calculateAndHandleCollision();
         } catch (error) { }
      };

      const calculateAndHandleCollision = () => {
         let slots = SlotManager.ins.gardenSlots;
         let itemBox = icon.getBoundingBoxToWorld();

         for (const slot of slots) {
            if (!slot || !slot.interactable) continue;
            let slotBox = slot.node.getBoundingBoxToWorld();
            slotBox = Utils.scaleRect(slotBox, 0.5);

            if (slotBox.intersects(itemBox)) return handleCollision(slot);
         }
      }

      const handleCollision = (collidedSlot: Slot) => { this.handleSlotInteraction(itemCard, collidedSlot); }

      GardenBackground.eventInstance.on(GARDEN_BG_EVENTS.CLICK_END, () => { resetDragging(); }, this);
      icon.on(cc.Node.EventType.TOUCH_END, (touchEvent: cc.Event.EventTouch) => { if (movedFromOrigin) { resetDragging(); } });

      if (itemCard.itemData.count > 0)
         icon.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent: cc.Event.EventTouch) => {
            const touchPos = touchEvent.getLocation();
            const originPos = Utils.getWorldPos(itemCard.node);
            const distantFromOrigin = cc.Vec2.distance(originPos, touchPos);
            const minDistanceToStartDragging = 35;

            if (!movedFromOrigin && distantFromOrigin < minDistanceToStartDragging) return;
            targetPos = Utils.worldSpaceToLocal(touchPos, icon.parent);
            if (!movedFromOrigin) { startDrag(); }
         });

      icon.on(cc.Node.EventType.TOUCH_START, (touchEvent: cc.Event.EventTouch) => {
         if (this.currentSelectingItemCard == itemCard) return;
         this.releaseCurrentSelect();
         if (itemCard.itemData.count > 0) this.bindNewItemSelect(itemCard);
      }, this);
   }

   onClickOnSlot(slot: Slot) {
      const selectingItemCard = this.currentSelectingItemCard;
      if (!selectingItemCard) return;

      const itemData = selectingItemCard.itemData;
      if (itemData.count <= 0) return;

      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      const item = ITEMS[itemData.itemID];

      switch (itemData.itemType) {
         case ITEM_TYPE.SEED: {
            if (slot.state != SLOT_STATE.OCCUPIED) { this.releaseCurrentSelect(); return; }
            SlotManager.ins.plantSeedToSlot(item, slot);
            break;
         } case ITEM_TYPE.POT: {
            if (slot.state != SLOT_STATE.EMPTY) { this.releaseCurrentSelect(); return; }
            SlotManager.ins.addPotToSlot(item, slot);
            break;
         } case ITEM_TYPE.FERTILIZER: {
            if (slot.state != SLOT_STATE.PLANTED) { this.releaseCurrentSelect(); return; }
            if (!slot.plant
               || slot.plant.plantData.fertilized
               || !slot.plant.plantData.endTime
               || !slot.plant.plantData.watered) return;
            SlotManager.ins.addFertilizer(item, slot.plant);
            break;
         }
      }

      itemData.count -= 1;
      if (itemData.count == 0) { this.releaseCurrentSelect(); }
      selectingItemCard.updateAvailabilityState();
   }

   bindNewItemSelect(itemCard: ItemCard) {
      if (this.currentSelectingItemCard == itemCard) return;
      cc.tween(itemCard.node).to(0.25, { y: 30 }, { easing: 'sineOut' }).start();

      this.currentSelectingItemCard = itemCard;

      GardenBackground.eventInstance.on(GARDEN_BG_EVENTS.CLICK_END, this.releaseCurrentSelect, this);
      cc.systemEvent.on(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, this.releaseCurrentSelect, this);
      SlotInteractionUIManager.ins.onInteractSlotOverride = (slot) => { this.onClickOnSlot(slot); };
   }

   releaseCurrentSelect() {
      if (!this.currentSelectingItemCard) return;
      cc.tween(this.currentSelectingItemCard.node).to(0.25, { y: 0 }, { easing: 'sineOut' }).start();

      this.currentSelectingItemCard = null;
      GardenBackground.eventInstance.off(GARDEN_BG_EVENTS.CLICK_END, this.releaseCurrentSelect, this);
      cc.systemEvent.off(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI, this.releaseCurrentSelect, this);

      SlotInteractionUIManager.ins.onInteractSlotOverride = null;
   }

   blockHandleSlotInteraction = false
   handleSlotInteraction(itemCard: ItemCard, slot: Slot) {
      if (this.blockHandleSlotInteraction) return;
      this.blockHandleSlotInteraction = true;
      this.scheduleOnce(() => { this.blockHandleSlotInteraction = false }, 0.05);

      const itemData = itemCard.itemData;
      if (itemData.count <= 0) return;

      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      const item = ITEMS[itemData.itemID];

      switch (itemData.itemType) {
         case ITEM_TYPE.SEED: {
            if (slot.state != SLOT_STATE.OCCUPIED) return;
            SlotManager.ins.plantSeedToSlot(item, slot);
            break;
         } case ITEM_TYPE.POT: {
            if (slot.state != SLOT_STATE.EMPTY) return;
            SlotManager.ins.addPotToSlot(item, slot);
            break;
         } case ITEM_TYPE.FERTILIZER: {
            if (slot.state != SLOT_STATE.PLANTED) return;
            if (!slot.plant
               || slot.plant.plantData.fertilized
               || !slot.plant.plantData.endTime
               || !slot.plant.plantData.watered) return;
            SlotManager.ins.addFertilizer(item, slot.plant);
            break;
         }
      }

      itemData.count -= 1;
      if (itemData.count == 0) { this.releaseCurrentSelect(); }
      itemCard.updateAvailabilityState();
   }

   onClickTab(evt, CED) {
      if (this.blockAllAction) return;
      const pageIndex = parseInt(CED);

      if (pageIndex == this.currentPage) return;

      switch (pageIndex) {
         case INVENTORY_PAGE.SEED: { break; }
         case INVENTORY_PAGE.POT: { break; }
         case INVENTORY_PAGE.FERTILIZER: { break; }
         default: { return; }
      }

      this.currentPage = pageIndex;
      this.reloadInventory();
   }

   protected onDestroy(): void { InventoryBar.ins = null; }
}
