import Utils from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BackgroundIdle extends cc.Component {
   dir = 1;
   offset = 25;
   duration = 5;

   protected onLoad(): void {
      this.dir = Utils.getOneOrMinusOne();
      this.node.x += (this.dir * this.offset) / 2;
      const loop = () => {
         this.dir *= -1;
         cc.tween(this.node).to(this.duration + (this.duration * Math.random() * 0.1), { x: this.node.x + (this.dir * this.offset) }, { easing: 'sineInOut' }).call(() => {
            loop();
         }).start()
      }

      loop();
   }
}
