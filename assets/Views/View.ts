const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {
   @property(cc.Node) background: cc.Node = null
   @property(cc.Node) contentContainer: cc.Node = null
   @property(cc.Node) scrollViewContainer: cc.Node = null
}
