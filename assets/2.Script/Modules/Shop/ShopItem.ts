const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopItem extends cc.Component {
   @property(cc.Label) nameLb: cc.Label = null;

   @property([cc.Sprite]) itemIconSprs: cc.Sprite[] = [];

   // @property(cc.Node) propertyContainer: cc.Node = null;

   // @property(cc.Label) quantityLb: cc.Label = null;
   @property(cc.Label) costLb: cc.Label = null;
   @property([cc.Sprite]) costIconSprs: cc.Sprite[] = [];

   onClickCallback = null;

   onClick() {
      this.onClickCallback?.();
   }
}
