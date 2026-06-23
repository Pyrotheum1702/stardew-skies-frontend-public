const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderboardItem extends cc.Component {
   @property(cc.Label) rankLb: cc.Label = null;
   @property(cc.Label) nameLb: cc.Label = null;
   @property(cc.Label) pointLb: cc.Label = null;
   @property(cc.Label) levelLb: cc.Label = null;
   @property(cc.Sprite) topSpr: cc.Sprite = null;
   @property(cc.Sprite) avatarSpr: cc.Sprite = null;

   scrollView = null;
   scrollViewWorldBoundingBox: cc.Rect = null;
   onClickCallback = null;

   t = 0;
   i = 0.1;

   setScrollView(scrollView: cc.Node) {
      this.scrollViewWorldBoundingBox = scrollView.getBoundingBoxToWorld();
   }

   protected update(dt: number): void {
      this.t += dt;

      if (this.t > this.i) {
         if (this.scrollViewWorldBoundingBox) {
            this.node.opacity = (this.scrollViewWorldBoundingBox.intersects(this.node.getBoundingBoxToWorld())) ? 255 : 0;
         }
         
         this.t -= this.i;
      }
   }

   onClick() {
      this.onClickCallback?.();
   }
}
