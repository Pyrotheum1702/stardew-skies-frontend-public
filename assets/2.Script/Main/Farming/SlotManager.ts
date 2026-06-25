import Api from "../../Network/Api";
import { REQUEST_OPERATION, CONFIG } from "../../Config/Config";
import AnimationOnEnable, { ANIM_TYPE } from "../../Helper/AnimationOnEnable";
import { callFloatingText } from "../../Helper/FloatingText";
import { GlobalVar } from "../../Helper/GlobalVar";
import LocalStorage from "../../Helper/LocalStorage";
import Utils from "../../Helper/Utils";
import { callActionBlocker } from "../../Modules/ActionBlock/ActionBlocker";
import { callConfirmationPopup } from "../../Modules/ConfirmationPopup/ConfirmationPopup";
import { callHighlight } from "../../Modules/Highlight/Highlight";
import LevelUpPopup, { callLvlUpPopup } from "../../Modules/LevelUPPopup/LevelUpPopup";
import { callNonBlockingTutorialDialog } from "../../Modules/TutorialDialog/TutorialDialog";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../Item";
import MainCtrl from "../MainCtrl";
import ProfileInfoManager from "../Profile/ProfileInfoManager";
import UIController, { UI_VIEW_MODE } from "../UI/UIController";
import GardenAssetManager from "./GardenAssetManager";
import Plant, { PLANT_EVENT } from "./Plant";
import Pot from "./Pot";
import Slot, { SLOT_EVENT, SLOT_STATE } from "./Slot";
import CoinDrop from "./SlotInteractionUI/PlantHarvestingUI/CoinDrop";
import SlotInteractionUIManager from "./SlotInteractionUI/SlotInteractionUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotManager extends cc.Component {
   public static ins: SlotManager = null;

   @property(cc.Prefab) potPref: cc.Node = null;
   @property(cc.Prefab) plantPref: cc.Node = null;
   @property(cc.Prefab) slotTimeLeftLbPref: cc.Prefab = null;
   @property(cc.Prefab) alertUIPref: cc.Prefab = null;
   @property(cc.Prefab) bugAlertUIPref: cc.Prefab = null;
   @property(cc.Prefab) wateringCanPref: cc.Prefab = null;
   @property(cc.Prefab) fertilizerBagPref: cc.Prefab = null;
   @property(cc.Prefab) coinDropPref: cc.Prefab = null;

   currentViewMode: UI_VIEW_MODE = UI_VIEW_MODE.NORMAL;
   gardenSlots: Slot[] = [];
   protected onLoad(): void { SlotManager.ins = this; }

   createPot(potItemID, slot: Slot): Pot {
      const item = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS[potItemID];

      let pot = cc.instantiate(this.potPref);
      pot.setParent(slot.node);
      pot.setPosition(0, 0);
      let potScript = pot.getComponent(Pot);
      potScript.slot = slot;
      potScript.sprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.potSprFrames[item.spriteIndex || 0]; });
      slot.pot = potScript;
      return potScript;
   }

   createPlant(itemData, slot: Slot): Plant {
      let plant = cc.instantiate(this.plantPref);
      plant.setParent(slot.node);
      plant.setPosition(0, CONFIG.PLANT_OFFSET_Y);
      let plantScript = plant.getComponent(Plant);
      plantScript.slot = slot;
      plantScript.updatePlantData(itemData);
      plantScript.stageSpriteFrames[0] = GardenAssetManager.ins.seedSprFrame;
      plantScript.stageSpriteFrames[1] = GardenAssetManager.ins.plantAdultSprFrames[itemData.spriteIndex];
      plantScript.stageSpriteFrames[2] = GardenAssetManager.ins.plantMaturedSprFrames[itemData.spriteIndex];
      slot.plant = plantScript;
      this.handlePlantEvent(plantScript);
      return plantScript;
   }

   setPotAtSlot(slotData, slot: Slot): Pot {
      let pot = this.createPot(slotData.pot, slot);
      slot.updateState(SLOT_STATE.OCCUPIED);
      return pot;
   }

   setPlantAtSlot(plantData, slot: Slot): Plant {
      let plant = this.createPlant(plantData, slot);
      plant.initPlantStage();
      slot.updateState(SLOT_STATE.PLANTED);
      return plant;
   }

   addPotToSlot(itemData, slot: Slot) {
      if (!slot.interactable) return;
      slot.interactable = false;

      Api.sendRequest({
         operation: REQUEST_OPERATION.PLACE_POT,
         floor: slot.floorIndex,
         slot: slot.slotIndex,
         itemID: itemData.itemID
      }, (response) => {
         // console.log({ addPotToSlotRequestResponse: response });
         let potScript = this.createPot(itemData.itemID, slot);
         const pot = potScript.node;
         const slotStateBeforeUpdate = slot.state;
         slot.updateState(SLOT_STATE.OCCUPIED);

         pot.opacity = 0;
         this.scheduleOnce(() => {
            const animComp = pot.getComponent(AnimationOnEnable);
            animComp.node.opacity = 255;
            animComp.resetStat();
            animComp.transitionTime = 0.2;
            animComp.trigger(ANIM_TYPE.UP_TO_DOWN);
         })

         GlobalVar.garden = response.garden;
         GlobalVar.inventory = response.inventory;

         slot.slotData.pot = response?.pot || null;
         potScript.itemID = response?.pot?.itemID || null;

         slot.interactable = true;
      }, (error) => {
         console.log({ addPotToSlotRequestError: error });

         slot.interactable = true;
         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
      })
   }

   plantSeedToSlot(itemData, slot: Slot) {
      if (!slot.interactable) return;
      slot.interactable = false;

      Api.sendRequest({
         operation: REQUEST_OPERATION.PLANT_SEED,
         floor: slot.floorIndex,
         slot: slot.slotIndex,
         itemID: itemData.itemID
      }, (response) => {
         let plantScript = this.createPlant(itemData, slot);
         const plant = plantScript.node;
         plantScript.updateLifecycle();

         plant.opacity = 0;
         this.scheduleOnce(() => {
            const animComp = plant.getComponent(AnimationOnEnable);
            animComp.node.opacity = 255;
            animComp.resetStat();
            animComp.transitionTime = 0.2;
            animComp.trigger(ANIM_TYPE.UP_TO_DOWN);
         })

         GlobalVar.garden = response.garden;
         GlobalVar.inventory = response.inventory;

         slot.slotData.plant = response.plant || null;
         plantScript.updatePlantData(response.plant);

         slot.updateState(SLOT_STATE.PLANTED);
         slot.interactable = true;
         slot.node.emit(SLOT_EVENT.PLANT_SEED);
      }, (error) => {
         slot.interactable = true;
         console.log({ addPotToSlotRequestError: error });

         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
      });
   }

   waterPlant(plant: Plant) {
      const slot = plant.slot;
      if (!slot.interactable) return;
      slot.interactable = false;

      Api.sendRequest({
         operation: REQUEST_OPERATION.WATER_PLANT,
         slot: plant.slot.slotIndex,
         floor: plant.slot.floorIndex,
      }, (response) => {
         slot.interactable = true;

         let wateringCan = cc.instantiate(SlotManager.ins.wateringCanPref);
         wateringCan.setParent(plant.slot.node);
         wateringCan.setPosition(CONFIG.WATERING_CAN_OFFSET_V);
         wateringCan.angle = CONFIG.WATERING_CAN_OFFSET_ANGLE;

         wateringCan.getComponentsInChildren(cc.Animation).forEach(anim => { anim.node.active = false; })
         Utils.fadeInNode(wateringCan, 0.25, () => {
            let anims = Utils.shuffle(wateringCan.getComponentsInChildren(cc.Animation));
            let i = 0;
            anims.forEach(anim => {
               this.scheduleOnce(() => {
                  if (!anim || !anim.node) return;

                  anim.node.parent.angle += Math.random() * 22;
                  anim.node.parent.scale = 0.75 + Math.random() * 0.45;
                  anim.node.active = true;
                  anim.play();
                  anim.currentClip.speed = 1 + Math.random() * 0.15;
               }, i * 0.15 * Math.random() * 1.25);

               i += 1;
            })

            cc.tween(wateringCan).to(0.75, { angle: wateringCan.angle + CONFIG.WATERING_CAN_ANIM_ANGLE_TILT }, { easing: 'backOut' }).call(() => {
               cc.tween(wateringCan).to(0.25, { opacity: 0 }, { easing: 'sineIn' }).call(() => { wateringCan.destroy(); }).start();
            }).start();
         });

         plant.hideAlert();
         plant.updatePlantData(response.plant);

         GlobalVar.garden = response.garden;
         slot.node.emit(SLOT_EVENT.WATER_PLANT);
      }, (error) => {
         plant.slot.interactable = true;

         console.log({ waterPlantError: error });
         plant.alertIcon = null;
         plant.plantData.watered = false;
         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
      })
   }

   addFertilizer(itemData, plant: Plant) {
      const slot = plant.slot;
      if (!slot.interactable) return;
      slot.interactable = false;

      Api.sendRequest({
         operation: REQUEST_OPERATION.ADD_FERTILIZER,
         floor: slot.floorIndex,
         slot: slot.slotIndex,
         itemID: itemData.itemID,
      }, (response) => {
         slot.interactable = true;
         // console.log({ itemData, addFertilizerResponse: response });

         let fertilizerBag = cc.instantiate(SlotManager.ins.fertilizerBagPref);
         fertilizerBag.setParent(plant.slot.node);
         fertilizerBag.setPosition(CONFIG.FERTILIZER_BAG_OFFSET_V);
         fertilizerBag.angle = CONFIG.FERTILIZER_BAG_OFFSET_ANGLE;
         fertilizerBag.getComponentsInChildren(cc.Sprite).forEach(spr => {
            spr.spriteFrame = GardenAssetManager.ins.fertilizerSprFrames[itemData.spriteIndex || 0];
         });

         Utils.fadeInNode(fertilizerBag, 0.25, () => {
            cc.tween(fertilizerBag).to(0.75, { angle: fertilizerBag.angle + CONFIG.FERTILIZER_BAG_ANIM_ANGLE_TILT }, { easing: 'backOut' }).call(() => {
               cc.tween(fertilizerBag).to(0.25, { opacity: 0 }, { easing: 'sineIn' }).call(() => { fertilizerBag.destroy(); }).start();
            }).start();
         });

         plant.updatePlantData(response.plant);
         slot.node.emit(SLOT_EVENT.FERTILIZE_PLANT);
      }, (error) => {
         slot.interactable = true;
         console.error({ error });
         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
      })
   }

   catchBug(plant: Plant) {
      const slot = plant.slot;
      if (!slot.interactable) return;
      slot.interactable = false;

      Api.sendRequest({
         operation: REQUEST_OPERATION.CATCH_BUG,
         floor: slot.floorIndex,
         slot: slot.slotIndex,
      }, (response) => {
         let harvestHand = cc.instantiate(SlotInteractionUIManager.ins.harvestHandPref);
         harvestHand.setParent(slot.node);
         harvestHand.setPosition(0, -75);
         this.scheduleOnce(() => {
            plant.updatePlantData(response.plant);
         }, 0.4);
         this.scheduleOnce(() => {
            harvestHand.destroy();
            slot.interactable = true;
         }, 1.4);
         slot.node.emit(SLOT_EVENT.CATCH_BUG);
      }, (error) => {
         slot.interactable = true;
         console.error({ error });
         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
      })
   }

   harvestPlant(plant: Plant) {
      const slot = plant.slot;
      slot.interactable = false;

      slot.plant.harvested = true;
      Api.sendRequest({
         operation: REQUEST_OPERATION.HARVEST_PLANT,
         floor: slot.floorIndex,
         slot: slot.slotIndex,
      }, (response) => {
         let harvestHand = cc.instantiate(SlotInteractionUIManager.ins.harvestHandPref);
         harvestHand.setParent(slot.node);
         harvestHand.setPosition(0, -75);
         this.scheduleOnce(() => {
            harvestHand.destroy();
            slot.interactable = true;
         }, 1.4);

         this.scheduleOnce(() => {
            const plantScript = slot.plant, central = cc.v2(0, 175), coinCount = Utils.random(5, 10);
            for (let i = 0; i < coinCount; i++) {
               this.scheduleOnce(() => {
                  const coin = cc.instantiate(this.coinDropPref);
                  const script = coin.getComponent(CoinDrop);
                  const offset = cc.v2(Utils.random(-25, 25), Utils.random(-25, 25));
                  const pos = cc.v2(central).add(offset);
                  const scale = 0.75 * (1 + Math.random() * 0.3);
                  const dir = pos.sub(central);
                  const velocity = dir.mulSelf(Utils.random(3, 5));

                  coin.setParent(slot.node), coin.setPosition(pos);
                  coin.scale = scale, coin.angle = Utils.random(-180, 180), coin.opacity = 0;

                  script.mass *= scale;
                  script.floorY += Utils.random(-5, 5);
                  script.velocity = { x: velocity.x * 3.5, y: velocity.y };
                  script.angularVelocity = Utils.random(-1080, 1080);

                  cc.tween(coin).to(0.1, { opacity: 255 }, { easing: 'sineIn' }).start();
                  script.scheduleOnce(() => cc.tween(coin).to(1, { opacity: 0 }, { easing: 'sineIn' }).call(() => coin.destroy()).start(), Utils.randomDecimal(1, 2));
               }, Utils.randomDecimal(0, 0.15));
            }

            cc.tween(slot.plant.node).to(0.2, { scale: slot.node.scale * 0.33, opacity: 0 }, { easing: 'sineOut' }).call(() => {
               slot.node.emit(SLOT_EVENT.HARVEST_PLANT);
               plantScript.node.destroy();

               if (response.notification) callLvlUpPopup(response.notification.message, "Continue", null);
            }).start();

            const plantWPos = Utils.getWorldPos(plantScript.node);
            callFloatingText(`+${response?.harvestedPlant?.yields?.coin || 0}`,
               cc.v2(plantWPos.x, plantWPos.y + plantScript.sprs[0].node.height * 0.5),
               2.5, 150, 45, {}, null,
               new cc.Color().fromHEX(`#FAFFBE`),
               new cc.Color().fromHEX(`#000000AA`))

            slot.plant = null;
            slot.updateState(SLOT_STATE.OCCUPIED);

            if (response.profile) {
               GlobalVar.profile = response.profile;
               ProfileInfoManager.ins.updateProfileInfo();
            }
         }, 1);
      }, (error) => {
         console.log({ error });

         const plantScript = slot.plant;
         plantScript.harvested = false;
         cc.tween(slot.plant.node).to(0.2, { scale: slot.node.scale * 0.85, opacity: 0 }, { easing: 'sineOut' }).call(() => {
            plantScript.node.destroy();

            slot.updateState(SLOT_STATE.OCCUPIED);
            slot.plant = null;
            slot.interactable = true;
         }).start();

         callTextNotification(4, error?.message || `Unknown Error!`, TextNotificationBGColor.RED);
      });

      const hand = SlotInteractionUIManager.ins.harvestHandIcon;
      hand.active = false;
   }

   handlePlantEvent(plant: Plant) {
      // console.log("handlePlantEvent", plant);

      plant.node.on(PLANT_EVENT.ADULT, () => {
         // console.log(plant, "ADULT");

      }, this);

      plant.node.on(PLANT_EVENT.MATURE, () => {
         if (plant.blockDialog) return;
         plant.blockDialog = true;

         const slot = plant.slot;
         // console.log(plant, "MATURE");
         const shownTutorial = LocalStorage.getItem('ShownTutorial2');
         if (shownTutorial == false) {
            let pos = Utils.getWorldPos(plant.node);
            pos.y += 70;
            const highlight = callHighlight(pos, () => {
               dialog.remove();
               let actionBlocker = callActionBlocker();
               slot.onClickEnd();
               plant.blockDialog = false;

               this.scheduleOnce(() => {
                  actionBlocker.remove();
                  if (LevelUpPopup.currentPopup) LevelUpPopup.currentPopup.onClickClose();

                  pos = Utils.getWorldPos(UIController.ins.mainUIElements[1]);

                  callHighlight(pos, () => { dialog.remove(); UIController.ins.onClickShopBtn(); });

                  dialog = callNonBlockingTutorialDialog([`And finally, check out the 🛒 Shop!\n\nYou will find 🪴 plants, 🪣 pots, ⏫ fertilizers, and more to level up your gardening adventure!`])
               }, 5);
            });

            let dialog = callNonBlockingTutorialDialog([`Your plant is fully grown! 🪴🎉\n\nTap it now to harvest and collect your rewards! 💰`]);
            LocalStorage.setItem('ShownTutorial2', true);
         }
      }, this);

      plant.node.on(PLANT_EVENT.BUG_APPEAR, () => {
         if (plant.blockDialog) return;
         plant.blockDialog = true;

         const slot = plant.slot;
         // console.log(plant, "BUG_APPEAR");
         const shownTutorial = LocalStorage.getItem('ShownTutorial3');
         if (shownTutorial == false) {
            let pos = Utils.getWorldPos(plant.node);
            pos.y += 70;
            const highlight = callHighlight(pos, () => {
               dialog.remove();
               slot.onClickEnd();
               plant.blockDialog = false;
            });

            const dialog = callNonBlockingTutorialDialog([`Watch out! 🐞 Insects are attacking your 🪴 plant!\n\nTap the plant to get rid of them before they cause damage.\n\n🐞 Insects can harm your 🪴 plant as it grows — this will reduce your final rewards!📉`]);
            LocalStorage.setItem('ShownTutorial3', true);
         }
      })
   }

   protected onDestroy(): void {
      SlotManager.ins = null;
   }
}