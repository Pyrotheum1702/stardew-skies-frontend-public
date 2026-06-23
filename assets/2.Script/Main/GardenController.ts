import { REQUEST_OPERATION } from "../Config/Config";
import { GlobalVar } from "../Helper/GlobalVar";
import { callLoadingDialog } from "../Helper/Loading/LoadingDialog";
import Utils from "../Helper/Utils";
import { callTextNotification, TextNotificationBGColor } from "../Notification/TextNotification";
import GardenFloorBuilder from "./GardenFloorBuilder/GardenFloorBuilder";
import UIController, { UI_VIEW_MODE } from "./UI/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GardenController extends cc.Component {
   public static ins: GardenController = null;

   @property(cc.Node) gardenBuilderNode: cc.Node = null;

   gardenBuilder: GardenFloorBuilder = null;

   protected onLoad(): void {
      GardenController.ins = this;
      this.gardenBuilder = this.gardenBuilderNode.getComponent(GardenFloorBuilder);
   }

   public buildMyGarden() {
      this.gardenBuilder.buildMyGarden();
   }

   public async spectateGarden(gardenUUID) {
      this.fetchGardenData(gardenUUID).then((gardenData) => {
         UIController.ins.setUIViewMode(UI_VIEW_MODE.SPECTATING);
         this.gardenBuilder.buildGarden(gardenData, true);
      });
   }

   async fetchGardenData(gardenUUID): Promise<any> {
      return new Promise((resolve, reject) => {
         let loading = callLoadingDialog(15, () => { callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED); });
         Utils.sendRequest({
            operation: REQUEST_OPERATION.SPECTATE_GARDEN,
            gardenUUID: gardenUUID,
         }, (response) => {
            loading.endImmediately();
            return resolve(response.garden);
         }, (error) => {
            console.error(error?.message);
            loading.endImmediately();
            callTextNotification(4, error?.message || `Unknown error!`, TextNotificationBGColor.RED);
            return reject(error?.message || error);
         })
      })
   }

   protected onDestroy(): void {
      GardenController.ins = null;
   }
}
