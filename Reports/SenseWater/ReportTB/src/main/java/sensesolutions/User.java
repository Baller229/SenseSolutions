package sensesolutions;

import java.util.ArrayList;
import java.util.List;

public class User
{
   UserData userData;
   private static List<UserData> users = new ArrayList<> ();
   public User(UserData userData)
   {
      this.userData = userData;
      this.users.add (userData);
   }

   public  List<UserData> getUsers(){return users;}
}
