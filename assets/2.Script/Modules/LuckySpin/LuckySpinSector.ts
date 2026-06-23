const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckySpinSector extends cc.Component {
   @property(cc.Label) rewardCountLb: cc.Label = null;
   @property(cc.Sprite) rewardSpr: cc.Sprite = null;
}
