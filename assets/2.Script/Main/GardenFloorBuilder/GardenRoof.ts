const { ccclass, property } = cc._decorator;

@ccclass
export default class GardenRoof extends cc.Component {
   @property(cc.Node) addFloorBtn: cc.Node = null;
   onClickAddFloorCallBack = null;
   onClickAddFloor() {
      this.onClickAddFloorCallBack?.();
   }
}
