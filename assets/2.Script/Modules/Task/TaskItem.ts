const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskItem extends cc.Component {
   @property(cc.Label) nameLb: cc.Label = null;
   @property(cc.Label) btnLb: cc.Label = null;
   @property(cc.Sprite) iconSpr: cc.Sprite = null;
   @property(cc.Button) actionBtn: cc.Button = null;
   @property([cc.Label]) rewardLbs: cc.Label[] = [];
   @property([cc.Sprite]) rewardSprs: cc.Sprite[] = [];
   @property([cc.Sprite]) actionBtnSprs: cc.Sprite[] = [];
}
