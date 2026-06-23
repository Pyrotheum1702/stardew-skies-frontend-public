import { GlobalVar } from "./GlobalVar";

const { ccclass, property } = cc._decorator;

export const storageKey = {
   // playerData: GlobalVar.PRODUCER + "-" + GlobalVar.GAME_NAME + '-' + 'PlayerData',
   // item: GlobalVar.PRODUCER + "-" + GlobalVar.GAME_NAME + '-' + 'Item',
   // reportedConnectedWalletAddress: GlobalVar.PRODUCER + "-" + GlobalVar.GAME_NAME + '-' + 'ReportedConnectedWalletAddress',
}

@ccclass
export default class LocalStorage extends cc.Component {
   // public static setPlayerData(data: Object) { cc.sys.localStorage.setItem(storageKey.playerData, JSON.stringify(data)) }
   // public static getPlayerData() {
   //    let data = cc.sys.localStorage.getItem(storageKey.playerData)
   //    if (!cc.isValid(data)) {
   //       return null
   //    } else return JSON.parse(data);
   // }
   public static setItem(key: string, data: Object) { cc.sys.localStorage.setItem(key, JSON.stringify(data)) }
   public static getItem(key: string) {
      let data = cc.sys.localStorage.getItem(key)
      if (!cc.isValid(data)) {
         return null
      } else return JSON.parse(data);
   }

   // // BOOLEAN
   // public static setReportedConnectedWalletAddress(boolean: Boolean) { cc.sys.localStorage.setItem(storageKey.reportedConnectedWalletAddress, boolean) }
   // public static getReportedConnectedWalletAddress() {
   //    let data = cc.sys.localStorage.getItem(storageKey.reportedConnectedWalletAddress)
   //    // console.log('getReportedConnectedWalletAddress', JSON.parse(data));
   //    return JSON.parse(data);
   // }
}
