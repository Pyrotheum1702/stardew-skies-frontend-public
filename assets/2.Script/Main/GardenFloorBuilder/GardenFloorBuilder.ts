import { REQUEST_OPERATION, CONFIG } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import UnlockNewFloorPanel from "../../Modules/UnlockNewFloor/UnlockNewFloor";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import AssetContainer from "../AssetContainer";
import Floor from "../Farming/Floor";
import Slot, { SLOT_STATE } from "../Farming/Slot";
import SlotManager from "../Farming/SlotManager";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../Item";
import ProfileInfoManager from "../Profile/ProfileInfoManager";
import UIController from "../UI/UIController";
import GardenRoof from "./GardenRoof";

const { ccclass, property } = cc._decorator;

const slotOffset = 182.5;
const gardenBuilderStartPosition: cc.Vec2 = cc.v2(-420, -230);
const floorObjectContainerStartPosition: cc.Vec2 = cc.v2(147, 21);

export const floorsYOffset = 364;

@ccclass
export default class GardenFloorBuilder extends cc.Component {
   public static ins: GardenFloorBuilder = null;

   @property(cc.Prefab) gardenFloorPref: cc.Prefab = null;
   @property(cc.Prefab) gardenRoofPref: cc.Prefab = null;
   @property(cc.Prefab) slotPref: cc.Prefab = null;
   @property(cc.Prefab) unlockFloorPanelPref: cc.Prefab = null;
   @property([cc.Prefab]) vinePrefs: cc.Prefab[] = [];

   @property(cc.Node) gardenFloorContainer: cc.Node = null;
   @property(cc.Node) floorNavigator: cc.Node = null;

   floors: Floor[] = [];
   blockAllAction = false;
   currentBuildPosition: cc.Vec2 = cc.v2(gardenBuilderStartPosition);
   _gardenRoof: GardenRoof = null;
   currentHighestFloorIndex = 0;

   public get gardenRoof(): GardenRoof {
      if (!this._gardenRoof) {
         const node = cc.instantiate(this.gardenRoofPref);
         this._gardenRoof = node.getComponent(GardenRoof);
         this._gardenRoof.onClickAddFloorCallBack = () => { this.onClickLockIcon(); };
      }

      return this._gardenRoof;
   }

   protected onLoad(): void {
      GardenFloorBuilder.ins = this;
      this.init();
   }

   private init() {
      this.buildMyGarden();
   }

   public buildMyGarden() {
      this.reloadMyGarden();
   }

   public buildGarden(gardenData, isSpectateMode) {
      this.cleanUpGarden();
      this.buildGardenInstant(gardenData);
   }

   public cleanUpGarden() {
      this.gardenFloorContainer.removeAllChildren(true);
   }

   async reloadMyGarden() {
      this.cleanUpGarden();
      const garden = await this.fetchGardenData();
      this.buildGardenInstant(garden);
   }

   async fetchGardenData(): Promise<any> {
      return new Promise((resolve, reject) => {
         let loading = callLoadingDialog(15, () => { callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED); });
         Utils.sendRequest({
            operation: REQUEST_OPERATION.GET_GARDEN,
         }, (response) => {
            loading.endImmediately();
            if (response.garden) GlobalVar.garden = response.garden;
            return resolve(response.garden);
         }, (error) => {
            loading.endImmediately();
            console.error(error?.message);
            callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
            return reject(error?.message || error);
         })
      })
   }

   public buildGardenInstant(garden: any) {
      const floorData = garden.floors;

      this.floors = [];
      SlotManager.ins.gardenSlots = [];
      this.currentHighestFloorIndex = 0;
      const floorCount = garden?.floors?.length + 1;
      if (floorCount < 1) throw new Error(`invalid floor count:${floorCount}`)

      this.currentBuildPosition = cc.v2(gardenBuilderStartPosition);
      for (let floorIndex = 0; floorIndex < floorCount; floorIndex++) {
         const newFloor = this.insertNewFloor(this.currentBuildPosition);
         if (floorIndex + 1 < floorCount) { this.currentBuildPosition.y += floorsYOffset; }

         try {
            if (floorIndex + 1 < floorCount) {
               this.buildFloorSlots(newFloor, floorData[floorIndex]);
            }
         } catch (error) { console.error(error); }
      }

      this.insertGardenRoof(this.currentBuildPosition);
      this.reAssignLockedFloor();
   }

   private reAssignLockedFloor() {
      for (let i = 0; i < this.floors.length; i++) {
         const floor = this.floors[i];

         floor.lockIcon.active = false;

         if (i == this.floors.length - 1) {
            // if (floor.lockIcon.active == false) Utils.fadeInNode(floor.lockIcon);
            floor.slots.forEach(slot => { Utils.fadeOutNode(slot.node); });
            // cc.tween(floor.cloudPlatform).to(0.25, { color: new cc.Color().fromHEX(`#EBEBEBE6`) }, { easing: 'sineIn' }).start();
            cc.tween(floor.cloudPlatform).to(0.25, { color: cc.Color.WHITE }, { easing: 'sineIn' }).start();

            if (floor.vines[0] == null) {
               const vine = cc.instantiate(this.vinePrefs[0]);
               floor.node.insertChild(vine, 1);
               floor.vines[0] = vine;
               Utils.fadeInNode(vine);
            }

            if (floor.vines[1] == null) {
               const vine = cc.instantiate(this.vinePrefs[1]);
               floor.node.insertChild(vine, 3);
               floor.vines[1] = vine;
               Utils.fadeInNode(vine);
            }
         } else {
            // if (floor.lockIcon.active) Utils.fadeOutNode(floor.lockIcon);
            floor.slots.forEach(slot => { Utils.fadeInNode(slot.node); });
            cc.tween(floor.cloudPlatform).to(0.25, { color: cc.Color.WHITE }, { easing: 'sineIn' }).start();

            if (floor.vines[0] != null && floor.vines[0].active) {
               const children = floor.vines[0].children;
               children.forEach(node => {
                  cc.tween(node).to(1.5, { scale: 0, opacity: 0 }, { easing: 'sineIn' }).start();
               })
               this.scheduleOnce(() => {
                  Utils.fadeOutNode(floor.vines[0], 0.25, null, true);
               }, 1.5)
            }
            if (floor.vines[1] != null && floor.vines[1].active) {
               const children = floor.vines[1].children;
               children.forEach(node => {
                  cc.tween(node).to(1.5, { scale: 0, opacity: 0 }, { easing: 'sineIn' }).start();
               })
               this.scheduleOnce(() => {
                  Utils.fadeOutNode(floor.vines[1], 0.25, null, true);
               }, 1.5)
            }
         }
      }

      this.floorNavigator.active = (this.floors.length > 2)
   }

   private insertNewFloor(buildPosition): Floor {
      const floor = cc.instantiate(this.gardenFloorPref);
      this.gardenFloorContainer.insertChild(floor, 0);
      floor.setPosition(buildPosition);

      let floorScript = floor.getComponent(Floor);

      let objectContainer = new cc.Node();
      objectContainer.setParent(floor);
      objectContainer.setPosition(floorObjectContainerStartPosition);

      floorScript.objectContainer = objectContainer;
      floorScript.floorIndex = this.currentHighestFloorIndex;
      floorScript.onClickLockIconCallback = () => { this.onClickLockIcon(); };
      this.floors.push(floorScript);

      this.currentHighestFloorIndex++;
      return floorScript;
   }

   public buildFloorSlots(floor: Floor, floorData: any[]) {
      for (let i = 0; i < floorData.length; i++) {
         const slotData = floorData[i];

         const node = cc.instantiate(this.slotPref);
         node.setParent(floor.objectContainer);
         node.setPosition(i * slotOffset, 0);

         const slot = node.getComponent(Slot);
         slot.floorIndex = floor.floorIndex;
         slot.slotIndex = i;
         slot.slotData = slotData;
         SlotManager.ins.gardenSlots.push(slot);
         floor.slots.push(slot);

         if (slotData.pot == null) {
            if (slotData.pot == null) slot.updateState(SLOT_STATE.EMPTY, slotData);
         } else {
            if (!slotData.pot) continue;
            SlotManager.ins.setPotAtSlot(slotData, slot);

            if (!slotData.plant) continue;
            SlotManager.ins.setPlantAtSlot(slotData.plant, slot);
         }
      }
   }

   public insertGardenRoof(position) {
      this.gardenFloorContainer.insertChild(this.gardenRoof.node, 0);
      this.gardenRoof.node.setPosition(position);
   }

   public onClickLockIcon() {
      const isSpectating = UIController.ins.getIsSpectating();
      if (isSpectating) return;

      if (this.blockAllAction) return;
      this.blockAllAction = true;

      let panel = cc.instantiate(this.unlockFloorPanelPref);
      panel.setParent(AssetContainer.ins.canvas);
      panel.setPosition(0, 0);

      let script = panel.getComponent(UnlockNewFloorPanel);
      script.floorIndex = GlobalVar.garden.floors.length;
      script.destroyCallback = () => { this.blockAllAction = false; };
      script.updateInfo();

      script.onClickActionCallback = () => {
         this.blockAllAction = false;
         script.blockAllAction = false;
         script.exit();
         this.addNewFloor(() => { });
      }
   }

   public addNewFloor(onComplete = null) {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      const newFloorIndex = GlobalVar.garden.floors.length;
      const lastFloor = this.floors[this.floors.length - 1];
      let loading = callLoadingDialog(4, () => { callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED); });

      Utils.sendRequest({
         operation: REQUEST_OPERATION.ADD_FLOOR,
         floor: newFloorIndex,
      }, (response) => {
         // console.log({ addNewFloorResponse: response });

         GlobalVar.profile = response.profile;
         GlobalVar.garden = response.garden;

         loading.endImmediately();
         ProfileInfoManager.ins.updateProfileInfo();

         // console.log(this.currentBuildPosition);
         this.currentBuildPosition.y += floorsYOffset;
         Utils.fadeOutNode(this.gardenRoof.node, 0.5, () => {
            let newFloor = this.insertNewFloor(this.currentBuildPosition);
            Utils.fadeInNode(newFloor.node, 0.44, () => {
               this.insertGardenRoof(this.currentBuildPosition);
               Utils.fadeInNode(this.gardenRoof.node, 0.44, () => {
                  this.blockAllAction = false;
                  try {
                     this.buildFloorSlots(lastFloor, response.garden.floors[newFloorIndex]);
                     this.reAssignLockedFloor();
                  } catch (error) { console.error(error); }
               })
            })
         })
         onComplete?.();
      }, (error) => {
         console.error({ error });

         loading.endImmediately();
         this.blockAllAction = false;
         callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
         onComplete?.();
      })
   }

   protected onDestroy(): void {
      GardenFloorBuilder.ins = null;
   }
}

export function getFloorConfig(floorIndex) {
   return SERVER_DYNAMIC_CONFIGURATIONS.ITEMS[`floor-${floorIndex}`];
}