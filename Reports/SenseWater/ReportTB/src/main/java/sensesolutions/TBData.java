package sensesolutions;
import com.google.gson.Gson;
import org.thingsboard.rest.client.RestClient;
import org.thingsboard.server.common.data.Device;
import org.thingsboard.server.common.data.id.DeviceId;
import org.thingsboard.server.common.data.kv.AttributeKvEntry;
import org.thingsboard.server.common.data.kv.TsKvEntry;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
// import mplog.MPLog;


public class TBData extends Thread
{
   User user;
   List<UserData> usersList = new ArrayList<> ();
 //==========================================================================================
   //  *** READ DATA FROM DEVICES IN THINGSBARD AND STORE THEM IN VARIABLES ***
   //==========================================================================================


   public User getTBAttributes() throws Exception
   {
      // MPLog.dbg("Read .json");
      Gson g = new Gson();
      String json = readFileAsString ("users.json");
      UserData[] userData = g.fromJson(json, UserData[].class);
      List<Thread> customers = new ArrayList<>();
      // MPLog.dbg(".json deserialized");
      for (int i = 0; i < userData.length; i++)
      {
         user = new User (userData[i]);
         usersList = user.getUsers ();
         int finalI = i;
         Thread customer = new Thread(new Runnable() {
            @Override
            public void run() {
               createDataForUser (usersList, finalI);
            }
         });
         customers.add(customer);
         customer.start();
         // MPLog.dbg("load user");
      }

      for (Thread thread : customers)
      {
         thread.join();
      }
      return user;
   }

   public static void createDataForUser(List<UserData> usersList, int i)
   {
      RestClient client = new RestClient(usersList.get (i).serverURL); 
      client.login(usersList.get (i).userName, usersList.get (i).password);
      fetchDevicesAttributesTelemetries(client ,usersList.get (i));
      client.logout();
      client.close();
   }

   public static void fetchDevicesAttributesTelemetries(RestClient client, UserData user)
   {
      Measurement t = new Measurement ();
      Map<Integer, List<List<TsKvEntry>>> devicesTelemetries = new LinkedHashMap<> ();
      List<Optional<Device>> devices = new ArrayList<> ();
      List<List<AttributeKvEntry>> attributes = new ArrayList<> ();

      user.dat = new ArrayList<> ();
      user.dat.add (new Object[]{devices, attributes, devicesTelemetries});

      for (int i = 0; i < user.devicesID.size (); i++)
      {
         List<List<TsKvEntry>> telemetries = new ArrayList<> ();
         devices.add(client.getDeviceById (DeviceId.fromString (user.devicesID.get (i))));
         attributes.add (client.getAttributesByScope(devices.get (i).get ().getId (), "SERVER_SCOPE", List.of("meno")));

         for (int k = 0; k < user.timeseries.size (); k++)
         {

            telemetries.add (client.getLatestTimeseries (devices.get (i).get ().getId (), List.of(user.timeseries.get (k))));
         }
         for (int k = 0; k < user.timeseries.size (); k++)
         {
            devicesTelemetries.put (i, telemetries);
         }
      }
      user.dat.get (0)[0] = devices;
      user.dat.get (0)[1] = attributes;
      user.dat.get (0)[2] = devicesTelemetries;
      //MPLog.dbg("fetch user devices and telemetries");
   }

   public static String readFileAsString(String file)throws Exception
   {
      return new String(Files.readAllBytes(Paths.get(file)));
   }

}
