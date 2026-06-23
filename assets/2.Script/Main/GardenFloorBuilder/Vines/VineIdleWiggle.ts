const { ccclass, property } = cc._decorator;

@ccclass
export default class VineIdleWiggle extends cc.Component {
   private originalRotation: number = 0;
   private direction: number = 1;
   private angleLimit: number = 2;   // Max degrees to rotate left/right
   private speed: number = 2;       // Degrees per second

   onLoad() {
      this.originalRotation = this.node.angle;
      this.angleLimit = 1 + Math.random() * 1;  // 3 to 6 degrees randomly
      this.speed = 2 + Math.random() * 1;     // 15 to 25 degrees/second randomly
   }

   update(dt: number) {
      this.node.angle += this.direction * this.speed * dt;

      const offset = this.node.angle - this.originalRotation;
      if (Math.abs(offset) >= this.angleLimit) {
         this.direction *= -1; // Reverse direction (ping-pong)
         this.node.angle = this.originalRotation + this.angleLimit * (offset > 0 ? 1 : -1);
      }
   }
}