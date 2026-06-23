import Drawer from "../Helper/Drawer";
import { GlobalVar } from "../Helper/GlobalVar";
import LocalStorage from "../Helper/LocalStorage";
import Utils from "../Helper/Utils";
import { callActionBlocker } from "../Modules/ActionBlock/ActionBlocker";
import { callHighlight, callHighlight2 } from "../Modules/Highlight/Highlight";
import InventoryBar from "../Modules/InventoryBar/InventoryBar";
import { callNonBlockingTutorialDialog, callTutorialDialog } from "../Modules/TutorialDialog/TutorialDialog";
import AssetContainer from "./AssetContainer";
import { SLOT_EVENT } from "./Farming/Slot";
import SlotInteractionUIManager from "./Farming/SlotInteractionUI/SlotInteractionUIManager";
import GardenFloorBuilder from "./GardenFloorBuilder/GardenFloorBuilder";
import UIController from "./UI/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {
   public static ins: MainCtrl = null;

   @property(cc.Node) canvas: cc.Node = null;
   @property(cc.Node) viewContainer: cc.Node = null;
   @property(UIController) uiController: UIController = null;

   views: cc.Node[] = []
   viewSwitchBtns: cc.Node[] = []

   protected onLoad(): void {
      try {
         MainCtrl.ins = this;
         AssetContainer.ins.canvas = this.canvas;
      } catch (error) {
         console.log(error);
      }

      this.scheduleOnce(() => {
         const shownTutorial = LocalStorage.getItem('ShownTutorial1');
         if (shownTutorial === false) {
            this.uiController.mainUIElements.forEach(el => el.active = false);

            this.scheduleOnce(() => {
               callTutorialDialog(
                  [
                     `Welcome to Garden Farm 🪴, where ☁️ cloud-based farming meets blockchain rewards. 💰💰💰`,
                     `Your mission is to build the most thriving garden in Stardew Skies by 🪴 planting, ✂️ harvesting, 📝 completing tasks, and earning rewards 💰— all while climbing higher through the clouds. ☁️`
                  ],
                  this.startTutorialSequence.bind(this)
               );
            }, 0.1);

            LocalStorage.setItem('ShownTutorial1', true);
            delete GlobalVar.profile.new;
         }
      }, 0.05);
   }

   private startTutorialSequence(): void {
      try {
         const slot = GardenFloorBuilder.ins.floors[0]?.slots[0];
         if (!slot) return console.warn('Slot not found');

         let slotPos = Utils.getWorldPos(slot.node);
         slotPos.y += 30;

         callHighlight(slotPos, () => {
            slot.onClickEnd();

            let actionBlocker = callActionBlocker();
            this.scheduleOnce(() => {
               actionBlocker.remove();
               const item = SlotInteractionUIManager.ins.currentItems[0];
               if (!item) return console.warn('Interaction item not found');

               const itemPos = Utils.getWorldPos(item);
               let h = callHighlight(itemPos, (evt) => {
                  item.emit(cc.Node.EventType.TOUCH_END, evt, SlotInteractionUIManager.ins);
                  Utils.fadeInNode(this.uiController.mainUIElements[5]);

                  actionBlocker = callActionBlocker();
                  this.scheduleOnce(() => {
                     actionBlocker.remove();
                     const item2 = InventoryBar.ins.currentItems[0];
                     if (!item2) return console.warn('Inventory item not found');

                     const slotPos = Utils.getWorldPos(slot.node);
                     const item2Pos = Utils.getWorldPos(item2.node);
                     const midPos = cc.v2((slotPos.x + item2Pos.x) / 2, (slotPos.y + item2Pos.y) / 2);

                     const highlight = callHighlight2(midPos, null);
                     dialog = callNonBlockingTutorialDialog([`Great! You’ve placed a 🪣 pot.\n\nNow, drag your 🌱 seed onto the pot to start growing it!`]);

                     slot.node.on(SLOT_EVENT.PLANT_SEED, () => {
                        Utils.fadeOutNode(highlight.node, 0.25, null, true);
                        dialog.remove();

                        actionBlocker = callActionBlocker();
                        this.scheduleOnce(() => {
                           actionBlocker.remove();
                           let finalPos = Utils.getWorldPos(slot.node);
                           finalPos.y += 100;

                           callHighlight(finalPos, () => {
                              actionBlocker = callActionBlocker();
                              this.scheduleOnce(() => {
                                 actionBlocker.remove();
                                 slot.onClickEnd();
                                 slot.onClickEnd();
                              });

                              this.uiController.mainUIElements.forEach(el => Utils.fadeInNode(el));
                              dialog.remove();
                           });
                           dialog = callNonBlockingTutorialDialog([`Plants need 💧 water, you know!\n\nTap the plant to water it so it starts growing!\n\nThroughout its lifetime, you can keep watering it to help it grow faster! ⌛`]);
                        }, 1);
                     });
                  }, 0.5);
               });
               h.clickRegion.setContentSize(50, 50);
            }, 0.5);
            dialog.remove();
         });
         let dialog = callNonBlockingTutorialDialog([`Let's start planting! 🌱\n\nFirst, place a planting 🪣 pot\n\nTap on the slot to choose one.`]);
      } catch (error) {
         console.error("Tutorial sequence error:", error);
      }
   }

   protected onDestroy(): void {
      MainCtrl.ins = null
   }
}
