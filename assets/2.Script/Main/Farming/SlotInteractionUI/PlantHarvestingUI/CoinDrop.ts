const { ccclass, property } = cc._decorator;

const airFriction = 0.93, gravity = 9.81;

@ccclass
export default class CoinDrop extends cc.Component {
   velocity = { x: 0, y: 0 };
   angularVelocity = 0; // degrees per second
   mass = 120;
   floorY = 0;

   protected update(dt: number): void {
      this.velocity.y -= gravity * dt * this.mass;
      this.velocity.x *= airFriction;
      this.angularVelocity *= airFriction; // optional: apply friction to spin too

      this.node.x += this.velocity.x * dt;
      this.node.y += this.velocity.y * dt;
      this.node.angle += this.angularVelocity * dt;

      if (this.node.y < this.floorY) this.node.y = this.floorY;
   }
}
