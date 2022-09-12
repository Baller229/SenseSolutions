package sensesolutions;

//import mplog.MPLog;
import sensesolutions.JavaMailUtill;

import java.util.List;
import java.util.*;

public class Main
{
   public static void main(String[] args) throws Exception
   {
      //MPLog.dbg ("Start!!");

      //==================================================
      List<Object[]> messages = new ArrayList<> ();
      JavaMailUtill javaMailUtill = new JavaMailUtill ();

      if(javaMailUtill.filesCreatedSuccessfully ())
      {
         messages = javaMailUtill.readFromCSV ();
         javaMailUtill.createMessages (messages);
      }
      else
      {
         messages = javaMailUtill.readFromCSV ();
         javaMailUtill.createMessages (messages);
         javaMailUtill.sendReportErrorMessage ();
      }
      //==================================================
   }
}

