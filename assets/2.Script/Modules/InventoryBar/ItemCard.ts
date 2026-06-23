const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemCard extends cc.Component {
   @property(cc.Node) icon: cc.Node = null;
   @property(cc.Label) countLb: cc.Label = null;
   @property([cc.Sprite]) iconSprs: cc.Sprite[] = [];

   itemData = {
      itemID: null,
      count: 0,
      itemType: null,
   };

   updateAvailabilityState() {
      this.node.opacity = (this.itemData.count <= 0) ? 150 : 255;
      this.countLb.string = `x${this.itemData.count}`;
   }
}
