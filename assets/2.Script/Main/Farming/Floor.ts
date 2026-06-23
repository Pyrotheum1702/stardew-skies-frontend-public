import Slot from "./Slot";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Floor extends cc.Component {
   @property(cc.Node) lockIcon: cc.Node = null;
   @property(cc.Node) cloudPlatform: cc.Node = null;

   floorIndex = -1;
   objectContainer: cc.Node = null;
   slots: Slot[] = [];
   onClickLockIconCallback = null;
   vines: cc.Node[] = [];

   protected onLoad(): void {
      this.lockIcon.active = false;
   }

   onClickLock() {
      this.onClickLockIconCallback?.();
   }
}
