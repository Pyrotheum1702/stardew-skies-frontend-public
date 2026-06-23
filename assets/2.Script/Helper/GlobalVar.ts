export class GlobalVar {
   public static accessToken = ``;

   public static profile: any = {
      uuid: '',
      name: '',
      first_name: '',
      last_name: '',
      user_name: '',
      avatarUrl: '',
      miningAccess: false,
      turboModeAccess: false,
   }

   public static inventory: any = {
      seed: {},
      fetched: false,
   }

   public static garden: any = {
      floors: {},
   }

   public static globalStatistic = {
      tokenMined: 0,
      totalToken: 1000000000,
      totalHolders: 0,
      miningStarted: "26 November 2024",
      top100: [],
   }

   public static rawInitData = "";
   public static webApp = null;
}
