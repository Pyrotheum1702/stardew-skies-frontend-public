import Slot from "./Slot";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pot extends cc.Component {
   @property([cc.Sprite]) sprs: cc.Sprite[] = [];
   itemID = null;

   slot: Slot = null;

   protected onLoad(): void {
      this.scheduleOnce(() => {
         this.node.on(cc.Node.EventType.TOUCH_START, this.slot.onClickStart, this);
         this.node.on(cc.Node.EventType.TOUCH_END, this.slot.onClickEnd, this);
      }, 0.1)
   }
}