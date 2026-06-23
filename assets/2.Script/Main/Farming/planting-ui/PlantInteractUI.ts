import Utils from "../../../Helper/Utils";
import FarmingController from "../FarmingController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlantInteractUI extends cc.Component {

   @property(cc.Label) timeLb: cc.Label = null;
   @property(cc.Label) costLb: cc.Label = null;

   clickActionCallback = null;
   endTime = null;
   plantData = null;
   stopped = false;

   onClickAction() {
      this.clickActionCallback?.();
   }

   protected onLoad(): void {
      this.scheduleOnce(() => { this.updateTimeInfo(); });
      this.schedule(this.updateTimeInfo, 0.25);
      this.costLb.string = '?';
   }

   updateTimeInfo() {
      if (!this.plantData || this.stopped) return;

      const timeLeft = Math.max(0, (this.plantData.endTime - Date.now()) / 1000);
      this.timeLb.string = Utils.parseTimeToReadableString2(Math.ceil(timeLeft) * 1000);

      if (timeLeft <= 0) {
         this.stopped = true;
         Utils.fadeOutNode(this.node, 0.25, null, true);
      }
   }
}
