import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Highlight extends cc.Component {
   @property(cc.Node) clickRegion: cc.Node = null;
   @property(cc.Node) hand: cc.Node = null;

   @property(cc.Node) dialogContent: cc.Node = null;
   @property(cc.Node) dialogContentLb: cc.Node = null;

   blockAllAction = false;
   onContinue = null;
   dialog = "";

   protected onLoad(): void {
      this.hand.active = false;
      this.scheduleOnce(() => {
         Utils.fadeInNode(this.hand);
      }, 0.3)
      this.clickRegion.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

      if (this.dialog) {

      }
   }

   onClick(evt = null) {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      Utils.fadeOutNode(this.node);
      this.onContinue?.(evt);
   }
}

export function callHighlight(worldPos: cc.Vec2, onClick = null) {
   const asset = AssetContainer.ins;
   const pref = asset.highlighPref;

   let node = cc.instantiate(pref);
   node.setParent(cc.director.getScene().getChildByName('Canvas'));
   node.setPosition(cc.v2(Utils.worldSpaceToLocal(worldPos, node.parent)));
   Utils.fadeInNode(node);

   let script = node.getComponent(Highlight);
   script.onContinue = onClick;

   return script;
}

export function callHighlight2(worldPos: cc.Vec2, onClick = null, dialog = "") {
   const asset = AssetContainer.ins;
   const pref = asset.highligh2Pref;

   let node = cc.instantiate(pref);
   node.setParent(cc.director.getScene().getChildByName('Canvas'));
   node.setPosition(cc.v2(Utils.worldSpaceToLocal(worldPos, node.parent)));
   Utils.fadeInNode(node);

   let script = node.getComponent(Highlight);
   script.onContinue = onClick;
   script.dialog = dialog;

   return script;
}