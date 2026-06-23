import Utils from "../../Helper/Utils";
import UIController, { UI_VIEW_MODE } from "../UI/UIController";
import Plant from "./Plant";
import Pot from "./Pot";
import SlotInteractionUIManager from "./SlotInteractionUI/SlotInteractionUIManager";
import SlotManager from "./SlotManager";

const { ccclass, property } = cc._decorator;

export enum SLOT_STATE {
   EMPTY = 0,
   OCCUPIED = 1,
   PLANTED = 2,
}

export const SLOT_EVENT = {
   PLACE_POT: "PLACE_POT",
   CATCH_BUG: "CATCH_BUG",
   PLANT_SEED: "PLANT_SEED",
   WATER_PLANT: "WATER_PLANT",
   HARVEST_PLANT: "HARVEST_PLANT",
   FERTILIZE_PLANT: "FERTILIZE_PLANT",
}

@ccclass
export default class Slot extends cc.Component {
   pot: Pot = null;
   plant: Plant = null;

   @property(cc.Node) emptyInteractionUI: cc.Node = null;

   floorIndex: number = null;
   slotIndex: number = null;
   slotData: any = null;
   blockEvent = false;
   interactable = true;
   timeLb: cc.Label = null;

   state: SLOT_STATE = SLOT_STATE.EMPTY;

   protected onLoad(): void {
      this.emptyInteractionUI.active = false;

      this.node.on(cc.Node.EventType.TOUCH_START, this.onClickStart, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onClickEnd, this);

      const lbNode = cc.instantiate(SlotManager.ins.slotTimeLeftLbPref);
      lbNode.setParent(this.node);
      lbNode.setPosition(0, 0);

      this.timeLb = lbNode.getComponent(cc.Label);
      this.timeLb.string = '';

      this.schedule(() => {
         // console.log(this.plant?.plantData.endTime);

         const timeLbChildIndex = this.timeLb.node.getSiblingIndex();
         if (timeLbChildIndex < this.timeLb.node.parent.children.length) {
            this.timeLb.node.setSiblingIndex(this.timeLb.node.parent.children.length - 1);
            // console.log(timeLbChildIndex, this.timeLb.node.parent.children.length);
         }

         const time = Math.max(0, this.plant?.plantData.endTime - Date.now() || 0)
         this.timeLb.string = Utils.parseTimeToReadableString2(time) || ''
         if (time <= 0) this.timeLb.string = ''
      }, 0.5)
   }

   updateState(state: SLOT_STATE, slotData?) {
      this.state = state;
      const isSpectating = UIController.ins.getIsSpectating();

      if (isSpectating) {
         if (this.emptyInteractionUI.active) Utils.fadeOutNode(this.emptyInteractionUI);
         return;
      }

      switch (this.state) {
         case SLOT_STATE.EMPTY:
            if (!this.emptyInteractionUI.active) Utils.fadeInNode(this.emptyInteractionUI);
            break;
         case SLOT_STATE.OCCUPIED:
            if (this.emptyInteractionUI.active) Utils.fadeOutNode(this.emptyInteractionUI);
            break;
         case SLOT_STATE.PLANTED:
            if (this.emptyInteractionUI.active) Utils.fadeOutNode(this.emptyInteractionUI);
            break;
      }

      if (slotData) this.slotData = slotData;
   }

   onClickStart() {
      if (!this.interactable) return;

   }

   onClickEnd() {
      if (!this.interactable) return;
      SlotInteractionUIManager.ins.onSlotInteract(this);
   }
}
