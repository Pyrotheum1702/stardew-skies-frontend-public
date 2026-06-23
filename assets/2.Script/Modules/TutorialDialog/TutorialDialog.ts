import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TutorialDialog extends cc.Component {
   @property(cc.Node) overlay: cc.Node = null;
   @property(cc.Label) contentLb: cc.Label = null;

   onContinue = null;
   blockAllAction = false;

   textIndex = 0;
   texts = [];
   text = '';
   displayText = '';
   charIndex = 0;
   textRunTime = 0;
   textRunSpeed = 1 / 60;
   textRunFinished = false;

   protected onLoad(): void {
      this.scheduleOnce(() => {
         if (this.onContinue) this.overlay.on(cc.Node.EventType.TOUCH_END, () => { this.onClickContinue(); });
      })
   }

   protected update(dt: number): void {
      if (this.charIndex >= this.text.length) {
         this.textRunFinished = true;
         return;
      }

      this.textRunTime += dt;
      if (this.textRunTime >= this.textRunSpeed) {

         this.displayText += this.text[this.charIndex];
         this.charIndex++;
         this.textRunTime -= this.textRunSpeed;
         this.contentLb.string = this.displayText;
      }
   }

   setText(string) {
      this.text = string;
      this.charIndex = 0;
      this.displayText = '';
      this.textRunFinished = false;
   }

   onClickContinue() {
      if (!this.textRunFinished) {
         this.displayText = this.text;
         this.contentLb.string = this.displayText;
         this.charIndex = this.text.length;
         this.textRunFinished = true;
         return;
      }

      if (this.textIndex < this.texts.length - 1) {
         this.textIndex++;
         this.setText(this.texts[this.textIndex]);
         return;
      }

      this.remove();
   }

   remove() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      this.onContinue?.();
      Utils.fadeOutNode(this.node, 0.25, null, true);
   }
}

export function callTutorialDialog(descriptions: string[], onContinue = null) {
   const asset = AssetContainer.ins;
   const pref = asset.tutorialDialogPref;

   let dialog = cc.instantiate(pref);
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'));
   dialog.setPosition(cc.v2(0, 0));
   Utils.fadeInNode(dialog);

   let script = dialog.getComponent(TutorialDialog);
   script.setText(descriptions[0]);
   script.texts = descriptions

   script.onContinue = onContinue;
   return script
}

export function callNonBlockingTutorialDialog(descriptions: string[], onContinue = null) {
   const asset = AssetContainer.ins;
   const pref = asset.nonBlockingTutorialDialogPref;

   let dialog = cc.instantiate(pref);
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'));
   dialog.setPosition(cc.v2(0, 0));
   Utils.fadeInNode(dialog);

   let script = dialog.getComponent(TutorialDialog);
   script.setText(descriptions[0]);
   script.texts = descriptions

   script.onContinue = onContinue;
   return script
}