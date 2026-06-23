const { ccclass, property } = cc._decorator;

@ccclass
export default class PlantHarvestUI extends cc.Component {
   @property(cc.Node) harvestIcon: cc.Node = null;
   @property(cc.Node) slotBg: cc.Node = null;
}
