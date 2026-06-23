import { CONFIG } from "../../Config/Config";
import Utils from "../../Helper/Utils";
import UIController from "../UI/UIController";
import GardenAssetManager from "./GardenAssetManager";
import Slot from "./Slot";
import SlotInteractionUIManager from "./SlotInteractionUI/SlotInteractionUIManager";
import SlotManager from "./SlotManager";

const { ccclass, property } = cc._decorator;

export enum PlantStage {
   SEED = 0,
   ADULT = 1,
   MATURED = 2
}

export const PLANT_EVENT = {
   ADULT: "ADULT",
   MATURE: "MATURE",
   BUG_APPEAR: "BUG_APPEAR",
}

@ccclass
export default class Plant extends cc.Component {
   @property([cc.Sprite]) sprs: cc.Sprite[] = [];
   stageSpriteFrames: cc.SpriteFrame[] = [null, null, null];

   slot: Slot = null;
   currentStage = null;
   plantData: any = {};
   alertIcon: cc.Node = null;
   alertIconSpr: cc.Sprite = null;
   bugAlert: cc.Node = null;
   harvested = false;
   blockDialog = false;

   protected onLoad(): void {
      this.schedule(this.updateLifecycle, 0.5);

      this.scheduleOnce(() => {
         this.sprs.forEach(spr => {
            spr.node.on(cc.Node.EventType.TOUCH_START, this.slot.onClickStart, this);
            spr.node.on(cc.Node.EventType.TOUCH_END, this.slot.onClickEnd, this);
            spr.node.on(cc.Node.EventType.MOUSE_MOVE, (event: cc.Event.EventMouse) => {
               const hand = SlotInteractionUIManager.ins.harvestHandIcon;
               const stage = this.calculateGrowthStage();
               const matured = stage == PlantStage.MATURED;
               const hasBug = this.hasBug();

               if ((!this.harvested && matured) || hasBug) {
                  hand.active = true;
                  hand.setPosition(Utils.worldSpaceToLocal(Utils.getWorldPos(this.slot.node), hand.parent));
               } else {
                  hand.active = false;
                  return;
               }
            }, this);
         });
      }, 0.1);
   }

   updatePlantData(plantData) {
      if (plantData == null) return;
      this.plantData = plantData;
   }

   updatePlantStage() {
      const stage = this.calculateGrowthStage();

      if (this.currentStage != stage) {
         switch (stage) {
            case PlantStage.ADULT:
               this.node.emit(PLANT_EVENT.ADULT);
               break;
            case PlantStage.MATURED:
               this.node.emit(PLANT_EVENT.MATURE);
               break;
         }
      }

      this.currentStage = stage;
   }

   initPlantStage() {
      this.updatePlantStage();
      this.sprs.forEach(spr => { spr.spriteFrame = this.stageSpriteFrames[this.currentStage]; })
   }

   updateLifecycle() {
      const stage = this.currentStage;
      this.updatePlantStage();

      if (stage != this.currentStage) {
         Utils.mushroomBounceNode(this.node, 0.44);
         this.sprs.forEach(spr => { spr.spriteFrame = this.stageSpriteFrames[this.currentStage]; });
      }

      this.refreshAlertState();
   }

   refreshAlertState() {
      if (this.hasBug()) {
         this.showBugAlert();
      } else {
         if (this.bugAlert?.active) {
            this.hideBugAlert();
         }
      }

      if (this.isReadyToHarvest()) {
         this.ensureAlertIcon();

         this.showHarvestAlert();
      } else if (this.isWaterable()) {
         this.ensureAlertIcon();

         this.showWaterAlert();
      } else {
         this.hideAlert();
      }
   }

   ensureAlertIcon() {
      if (this.alertIcon != null) {
         if (this.alertIcon.active == false) Utils.fadeInNode(this.alertIcon);
         return;
      }

      const alert = cc.instantiate(SlotManager.ins.alertUIPref);
      alert.setParent(this.slot.node);

      Utils.fadeInNode(alert);
      this.alertIcon = alert;
      this.alertIconSpr = alert.getComponent(cc.Sprite);

      this.alertIcon.scale = 0.7;
      this.alertIcon.setPosition(CONFIG.ALERT_OFFSET_V);
   }

   showWaterAlert() {
      if (this.calculateGrowthStage() != PlantStage.SEED) this.alertIcon.setPosition(CONFIG.ALERT_OFFSET_V);
      else this.alertIcon.setPosition(CONFIG.ALERT_OFFSET_LOW_V);

      this.alertIcon.active = true;
      this.alertIcon.scale = 0.7;
      this.alertIconSpr.spriteFrame = GardenAssetManager.ins.alertSprFrames[0];
   }

   showBugAlert() {
      if (this.bugAlert != null) {
         if (this.bugAlert.active == false) {
            Utils.fadeInNode(this.bugAlert);
         }
         return;
      }

      const alert = cc.instantiate(SlotManager.ins.bugAlertUIPref);
      alert.setParent(this.node);
      alert.setPosition(0, 0);
      alert.scale = 1;

      Utils.fadeInNode(alert);
      this.bugAlert = alert;
      this.node.emit(PLANT_EVENT.BUG_APPEAR);
   }

   showHarvestAlert() {
      this.alertIcon.active = true;
      this.alertIcon.setPosition(CONFIG.ALERT_OFFSET_V);
      // this.alertIcon.scale = 0.95;
      this.alertIconSpr.spriteFrame = GardenAssetManager.ins.alertSprFrames[2];
   }

   hideAlert() { if (this.alertIcon && this.alertIcon.active) Utils.fadeOutNode(this.alertIcon); }

   hideBugAlert() { if (this.bugAlert && this.bugAlert.active) Utils.fadeOutNode(this.bugAlert); }

   calculateGrowthProgress() {
      if (this.plantData.endTime <= 0 || this.plantData.endTime == null) return 0;

      const growthProgress = 1 - (this.plantData.endTime - Date.now()) / this.plantData.growthDuration
      const clampedGrowthProgress = Math.min(1, growthProgress);
      return clampedGrowthProgress;
   }

   calculateGrowthStage() {
      if (this.plantData.endTime == null || this.plantData.endTime < 0) return PlantStage.SEED;

      const growthProgress = this.calculateGrowthProgress();

      if (growthProgress >= 1) return PlantStage.MATURED;
      else if (growthProgress >= 0.2) return PlantStage.ADULT;
      else return PlantStage.SEED;
   }

   calculateHarvestTimeRemaining() {
      const timeLeft = Math.max(0, this.plantData.endTime - Date.now());
      return timeLeft;
   }

   isWaterable() {
      const notWateredYet = this.plantData.watered === false;
      const cooldownPassed =
         this.plantData.dateAllowWaterAgain != null &&
         this.plantData.dateAllowWaterAgain > 0 &&
         Date.now() >= this.plantData.dateAllowWaterAgain;

      return (notWateredYet || cooldownPassed) && !(this.currentStage == PlantStage.MATURED);
   }

   hasBug() {
      if (this.plantData?.bug == null) return false;
      const bug = this.plantData.bug;

      if (bug.removed == true) return false;

      const appearAt = bug.appearAt;
      if (appearAt <= 0 || appearAt >= 1) return false;

      const growthProgress = this.calculateGrowthProgress();

      if (growthProgress >= appearAt) return true;
      else return false;
   }

   isReadyToHarvest() { return (this.currentStage == PlantStage.MATURED); }

   protected onDestroy(): void {
      this.hideAlert();
      this.hideBugAlert();
   }
}