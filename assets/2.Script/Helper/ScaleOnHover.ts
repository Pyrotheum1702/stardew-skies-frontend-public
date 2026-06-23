const { ccclass, property } = cc._decorator;

@ccclass
export default class ScaleOnHover extends cc.Component {
   @property hoverScale: number = 1.1;
   @property duration: number = 0.1;

   private originalScale = 1;

   onLoad() {
      this.originalScale = this.node.scale;
      this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
      this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
   }

   onMouseEnter() {
      cc.tween(this.node)
         .stop()
         .to(this.duration, { scale: this.originalScale * this.hoverScale })
         .start();
   }

   onMouseLeave() {
      cc.tween(this.node)
         .stop()
         .to(this.duration, { scale: this.originalScale })
         .start();
   }

   onDestroy() {
      this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
      this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
   }
}
