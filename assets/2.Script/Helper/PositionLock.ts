const { ccclass, property } = cc._decorator;

@ccclass
export default class PositionLock extends cc.Component {
   @property(cc.Node) target: cc.Node = null;
   protected update(dt: number): void {
      this.node.setPosition(this.target.position);
   }
}