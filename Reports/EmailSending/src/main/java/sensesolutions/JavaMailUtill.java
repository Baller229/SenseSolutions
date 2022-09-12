package sensesolutions;

import javax.mail.internet.*;

import au.com.bytecode.opencsv.CSVReader;
import com.opencsv.bean.CsvToBeanBuilder;
//import mplog.MPLog;

import javax.activation.FileDataSource;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.FileReader;
import java.util.List;
import javax.mail.*;
import java.util.*;


public class JavaMailUtill
{
   // MY SMTP GMAIL
   static String from = "user@gmail.com";
   // DIRECTORY WHERE IS STORED .CSV FILE
   static String csv = "csvFile.csv";
   static String subject = "Subject";
   static String errSubject = "Report ERROR";
   static String messageText = "This is actual message";
   static String errMessageText = "Error";
   static String messageBody = "This is message body";
   static String errMessageBody = "Error";
   static Properties properties = createConfiguration();
   static SmtpAuthenticator authentication = new SmtpAuthenticator();
   static Session session = Session.getDefaultInstance(properties, authentication);

//=====================================================================
//  *** READ ALL EMAILS AND DIRECTORIES FROM .CSV FILE ***
//=====================================================================
   public  List<Object[]> readFromCSV()
   {
      List<Object[]> messages = new ArrayList<> ();
      List<String> test = new ArrayList<> ();
      String [] nextLine;
      try {
         CSVReader reader = new CSVReader(new FileReader (csv), ';');

         //Read one line at a time
         while ((nextLine = reader.readNext()) != null)
         {
            messages.add (new Object[]{new MimeMessage(session), nextLine[0], nextLine[1]});
            System.out.println(nextLine);
         }
      return messages;
      } catch (IOException e) {
         e.printStackTrace();
      }
      return null;
   }

//=====================================================================
//   *** ADD SUBJECT, TEXT AND ATTACHMENT IN EVERY MESSAGE ***
//=====================================================================
   public  void createMessages(List<Object[]> messages) throws Exception
   {
      try {
         Message message;
         for (int i = 0; i < messages.size (); i++)
         {
            message = new MimeMessage (session);
            message = (Message) messages.get (i)[0];
            message.setFrom(new InternetAddress(from));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress((String) messages.get (i)[1]));
            message.setSubject(subject);
            message.setText(messageText);

            // Create the message part
            BodyPart messageBodyPart = new MimeBodyPart();
            messageBodyPart.setText(messageBody);

            // Create a multipar message
            Multipart multipart = new MimeMultipart ();
            multipart.addBodyPart(messageBodyPart);

            // Attachment
            messageBodyPart = new MimeBodyPart();
            String filename = (String) messages.get (i)[2];
            DataSource source = new FileDataSource (filename);
            messageBodyPart.setDataHandler(new DataHandler (source));
            messageBodyPart.setFileName(filename);
            multipart.addBodyPart(messageBodyPart);

            // Fetch the complete message parts
            message.setContent(multipart);
         }

         // Send message to all users with specific .xlsx file
         sendMessage (messages.size (), messages);

         System.out.println("Sent message successfully....");
      } catch (MessagingException mex) {
      mex.printStackTrace();
      }

   }

//=====================================================================
//           *** FINALLY SEND MESSAGES TO ALL USERS ***
//=====================================================================
   public void sendMessage(int messagesSize, List<Object[]> messages) throws Exception
   {
      for (int i = 0; i < messagesSize; i++)
      {
         Transport.send( (Message) messages.get (i)[0]);
      }
   }

//=====================================================================
//    CHECK IF LINES IN CSV == NO OF FILES IN DIRECTORY
//=====================================================================
   public boolean filesCreatedSuccessfully() throws FileNotFoundException
   {
      File directory=new File("...target repository");
      int fileCount=directory.list().length;
      int fileCSVCount;
      System.out.println("File Count:"+fileCount);
      //MPLog.dbg ("Number of files in ...target repository: " + fileCount);
      List<String[]> filesInCSV;

      try (CSVReader reader = new CSVReader(new FileReader(csv)))
      {
         filesInCSV = reader.readAll();
         fileCSVCount = filesInCSV.size ();
         //MPLog.dbg ("Number of files in csv: " + filesInCSV.size ());
      }
      catch (IOException e)
      {
         throw new RuntimeException (e);
      }
      return fileCSVCount == fileCount;
   }

//=====================================================================
//    SEND MESSAGE WITH REPORT ERROR
//=====================================================================
   public void sendReportErrorMessage() throws MessagingException
   {
      Message message = new MimeMessage(session);
      message = new MimeMessage (session);
      message.setFrom(new InternetAddress(from));
      message.addRecipient(Message.RecipientType.TO, new InternetAddress("user2@gmail.com"));
      message.setSubject(errSubject);
      message.setText(errMessageText);
      // Create the message part
      BodyPart messageBodyPart = new MimeBodyPart();
      messageBodyPart.setText(errMessageBody);

      Multipart multipart = new MimeMultipart ();
      multipart.addBodyPart(messageBodyPart);
      message.setContent(multipart);
      Transport.send(message);
   }

//*********************************************************************
//                   MAIL TRANSPORT CONFIGURATION
//*********************************************************************
   private static Properties createConfiguration()
   {
      return new Properties()
      {
         {
         put("mail.smtp.auth", "true");
         put("mail.smtp.host", "smtp.gmail.com");
         put("mail.smtp.port", "587");
         put("mail.smtp.starttls.enable", "true");
         }
      };
   }

//*********************************************************************
//                SIMPLE MAIL TRANSFER PROTOCOL AUTHENTICATOR
//*********************************************************************
   private static class SmtpAuthenticator extends Authenticator
   {
      private String username = "smtpuser@gmail.com";
      private String password = "smtppassword";
      @Override
      public PasswordAuthentication getPasswordAuthentication()
      {
      return new PasswordAuthentication(username, password);
      }
   }
}
