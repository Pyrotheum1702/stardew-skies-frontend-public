import Api from "../../Network/Api";
import { REQUEST_OPERATION } from "../../Config/Config";
import { TASK_STATE } from "../../Config/Constant";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";
import ProfileInfoManager from "../../Main/Profile/ProfileInfoManager";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import TaskItem from "./TaskItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Task extends cc.Component {
   public static ins: Task = null;
   @property(cc.Node) overlayBG: cc.Node = null;
   @property(cc.Node) taskItemContainer: cc.Node = null;
   @property(cc.Prefab) taskItemPref: cc.Prefab = null;

   @property(cc.Material) spriteNormalMat: cc.Material = null;
   @property(cc.Material) spriteGrayMat: cc.Material = null;

   @property([cc.SpriteFrame]) actionBtnStateSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) rewardIconSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) taskIconSprFrames: cc.SpriteFrame[] = [];

   taskData = {};
   taskItems = {};

   blockAllAction = false;
   initFetchedTask = false;

   public static get Instance(): Task {
      if (Task.ins == null) {
         const asset = AssetContainer.ins;

         let task = cc.instantiate(asset.taskPref);
         task.setParent(asset.canvas)
         task.setPosition(0, 0);
         task.opacity = 0;
         task.active = false;

         Task.ins = task.getComponent(Task);
      }

      return Task.ins;
   }

   public reloadTask(taskData = null) {
      this.blockAllAction = true;
      let loading = callLoadingDialog(15, () => {
         callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED)
      })

      let onResponse = (response) => {
         // if (CC_DEV) console.log({ response });

         this.updateTaskItems(response.tasks);

         loading.endImmediately();
         this.blockAllAction = false;
         this.initFetchedTask = true;
      }

      if (taskData) {
         onResponse(taskData);
      } else Api.sendRequest({
         operation: REQUEST_OPERATION.GET_TASK,
      }, (response) => {
         onResponse(response)
      }, (error) => {
         console.error({ error });

         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED);
         loading.endImmediately();
         this.blockAllAction = false;
      });
   }

   private updateTaskItems(tasks) {
      try {
         for (let i = 0; i < Object.keys(tasks).length; i++) {
            const key = Object.keys(tasks)[i];
            let itemData = tasks[key];

            if (!this.taskItems[key]) {
               let item = cc.instantiate(this.taskItemPref).getComponent(TaskItem);
               this.taskItems[key] = item;

               item.node.setParent(this.taskItemContainer);

               let eventHandler = new cc.Button.EventHandler();
               eventHandler.target = this.node;
               eventHandler.component = 'Task';
               eventHandler.handler = 'onClickTask';
               eventHandler.customEventData = key;

               item.actionBtn.interactable = false;
               item.actionBtn.clickEvents.push(eventHandler)
            }

            let item: TaskItem = this.taskItems[key];
            this.taskData[key] = itemData;

            item.nameLb.string = itemData.name;
            item.iconSpr.spriteFrame = this.taskIconSprFrames[itemData.iconSpriteIndex];

            Object.keys(itemData.reward).forEach(rewardType => {
               switch (rewardType) {
                  case `coin`: {
                     item.rewardLbs[0].string = `+ ${itemData.reward.coin}`;
                     item.rewardSprs.forEach(spr => { spr.spriteFrame = this.rewardIconSprFrames[0]; });
                     break;
                  }
                  default: break;
               }
            });

            switch (itemData.state) {
               case TASK_STATE.NOT_DONE: {
                  item.btnLb.string = "Go";

                  item.actionBtnSprs.forEach(spr => {
                     spr.spriteFrame = this.actionBtnStateSprFrames[0];
                     spr.setMaterial(0, this.spriteNormalMat);
                  })

                  item.actionBtn.interactable = true;
                  item.node.opacity = 255; break;
               } case TASK_STATE.DONE: {
                  item.btnLb.string = "Verify";

                  item.actionBtnSprs.forEach(spr => {
                     spr.spriteFrame = this.actionBtnStateSprFrames[1];
                     spr.setMaterial(0, this.spriteNormalMat);
                  })

                  item.actionBtn.interactable = true;
                  item.node.opacity = 255; break;
               } case TASK_STATE.CLAIMED: {
                  item.btnLb.string = "Done";

                  item.actionBtnSprs.forEach(spr => {
                     spr.spriteFrame = this.actionBtnStateSprFrames[0];
                     spr.setMaterial(0, this.spriteGrayMat);
                  })

                  item.actionBtn.interactable = false;
                  item.node.opacity = 255; break;
               }
            }
         }

      } catch (error) { console.error(error); }
   }

   public onClickTask(evt, CED) {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      let waitTime = 1;
      let taskData = this.taskData[CED];

      if (!taskData) {
         callTextNotification(3, "Task not found.", TextNotificationBGColor.RED);
         this.scheduleOnce(() => { });
         return;
      }

      let loading = callLoadingDialog(15, () => {
         this.blockAllAction = false;
         callTextNotification(3, "Timeout.", TextNotificationBGColor.RED);
      });

      Api.sendRequest({
         operation: REQUEST_OPERATION.DO_TASK,
         key: CED,
      }, (response) => {
         console.log({ response });

         if (response.success == false) {
            callTextNotification(4, response?.message || "Unknown error!", TextNotificationBGColor.RED);
            this.blockAllAction = false;
            loading.endImmediately();
            return;
         }

         if (taskData.state == TASK_STATE.NOT_DONE) {
            setTimeout(() => { window.open(taskData.link, '_blank') });
            waitTime = 2;
         }

         if (response.profile) {
            GlobalVar.profile = response.profile;
            ProfileInfoManager.ins.updateProfileInfo();
         }

         this.scheduleOnce(() => {
            this.blockAllAction = false;
            loading.endImmediately();
            this.reloadTask(response);
         }, waitTime);
      }, (error) => {
         console.log({ error });
         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED);
         loading.endImmediately();
         this.blockAllAction = false;
      })
   }

   public showTask() {
      this.blockAllAction = true;
      Utils.fadeInNode(this.node);

      return this.reloadTask();
      if (!this.initFetchedTask) this.reloadTask();
      else { this.blockAllAction = false; }
   }

   public hideTask() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      if (this.node.active == true) Utils.fadeOutNode(this.node, 0.25, () => { });
      this.scheduleOnce(() => { this.blockAllAction = false; }, 0.25);
   }

   protected onLoad(): void {
      this.overlayBG.on(cc.Node.EventType.TOUCH_END, this.onClickTaskOverlayBG, this)
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.hideTask();
      }, this);
   }

   private onClickTaskOverlayBG() { this.hideTask(); }
   protected onDestroy(): void { Task.ins = null; }
}