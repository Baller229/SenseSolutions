package sensesolutions;

// import mplog.MPLog;
import sensesolutions.User;

public class Main {

   public static void main(String[] args) throws Exception
   {
         // MPLog.dbg("STARTED");
         Measurement t = new Measurement ();
         User user;
       //===========================================================================
         // Thingsboard API
         t.Start ();
         TBData tbData = new TBData ();
         user = tbData.getTBAttributes ();
         t.Stop ();
      //===========================================================================

      //===========================================================================
         // Apache POI (Excel) API
         InputExcel inputExcel = new InputExcel ();
         inputExcel.createExcel(user);
      //===========================================================================
         // MPLog.dbg ("Telemetries time in sec:" + t.GetDurationInSec ());
         // MPLog.dbg ("Telemetries time in milisec:" + t.GetDurationInMiliSec ());

   }
}