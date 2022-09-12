package sensesolutions;
//import mplog.MPLog;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;

import java.awt.Color;
import java.io.FileNotFoundException;
import org.apache.poi.ss.usermodel.*;
import org.thingsboard.server.common.data.kv.BaseAttributeKvEntry;
import org.thingsboard.server.common.data.kv.BasicTsKvEntry;
import org.thingsboard.server.common.data.kv.TsKvEntry;
import sensesolutions.User;
import sensesolutions.UserData;
import static java.util.Calendar.*;
import java.text.SimpleDateFormat;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.File;
import java.util.*;
import java.util.List;


public class InputExcel extends TBData {

//==========================================================================================
//                    *** LIST OF ALL USERS DESERIALIZED FROM JSON ***
//==========================================================================================
   List<UserData> users = new ArrayList<> ();

//==========================================================================================
//                               *** CURRENT DATE ***
//==========================================================================================
   String timeStamp = new SimpleDateFormat ("dd/MM/yyyy").format(getInstance().getTime());

//==========================================================================================
//                *** WRITE DATA TO EXCEL FOR ALL USERS IN JSON ***
//==========================================================================================
   public void createExcel(User user)
   {
   //MPLog.dbg("create excel for users");
   users = user.getUsers ();
      for (int i = 0; i < users.size (); i++)
      {
         try {
        // MPLog.dbg("try create excel for current user");
         WriteToExcel (user, i);
         } catch (IOException e) {
            // MPLog.err("could not create excel for user");
            throw new RuntimeException (e);
         }
      }
   }

//==========================================================================================
//         *** CUSTOMIZE EXCEL AND WRITE DATA TO EXCEL FOR CURRENT USER ***
//==========================================================================================
   public void WriteToExcel( User user, int current) throws IOException
   {
      // User data needs to be written (Object[])
      Map<String, Object[]> rowInExcel = new LinkedHashMap<String, Object[]>();
      OutputExcel outputExcel = new OutputExcel ();
      // workbook object
      XSSFWorkbook workbook = new XSSFWorkbook ();
      Color orange = new Color (227, 108, 9);
      Color green = new Color (194, 214, 155);
      Font headerFont = workbook.createFont();
      Font font = workbook.createFont();
      // cell style objects
      XSSFCellStyle headerStyle = workbook.createCellStyle ();
      XSSFCellStyle cellStyle = workbook.createCellStyle ();
      XSSFCellStyle cellStyle2 = workbook.createCellStyle ();
      XSSFCellStyle cellStyle3 = workbook.createCellStyle ();
      XSSFCellStyle cellStyle4 = workbook.createCellStyle ();
      // spreadsheet object
      XSSFSheet spreadsheet = workbook.createSheet (users.get (current).sheetName);
      // creating a row object
      XSSFRow row;
//------------------------------------------------------------------------------------------

//==========================================================================================
//                 *** CUSTOMIZE EXCEL CELLS COLOR, BORDER AND FONT ***
//==========================================================================================

   setExcelCellStyle (headerStyle, cellStyle, cellStyle2, cellStyle3, cellStyle4, orange, green, headerFont, font);

//==========================================================================================
//            *** CUSTOMIZE EXCEL CELL WIDTH AND MERGE SPECIFIC CELLS  ***
//==========================================================================================

   setMergeAndColumnWidth(spreadsheet, current);

//------------------------------------------------------------------------------------------

      // manually added first data to List when Excel is empty
      if(outputExcel.readFromExcel(users, current, countDevicesAndTelemetriesRatio (current)).isEmpty ())
      {
      // MPLog.dbg("Excel is empty, manually add first rows");
      rowInExcel = parseFirstData (current);
        users.get (current).uRowInExcel = (LinkedHashMap<String, Object[]>) rowInExcel;
      }
      // read data from Excel and rewrite all data to List + added new row
      else
      {
      // MPLog.dbg("Excel is not empty, reload rows");
      List<String> load5thLine = new ArrayList<> ();
         load5thLine = load5th (current);
         rowInExcel = null;
         rowInExcel = outputExcel.readFromExcel (users, current, countDevicesAndTelemetriesRatio (current));
         rowInExcel.put (nextKey (rowInExcel), new Object[]{timeStamp, load5thLine});
      }


//------------------------------------------------------------------------------------------
   // writing the data into the sheets from List
   Set<String> keyid = rowInExcel.keySet ();
   int rowid = 0;
   for (String key : keyid)
      {
         // MPLog.dbg("Try to write data into the sheets");
         row = spreadsheet.createRow ( rowid++ );
         if( rowid == 3 ) { row.setHeight ( (short) 800 ); }
         else{ row.setHeight ( (short) 300 ); }

         Object[] objectArr = rowInExcel.get ( key );
         int cellid = 0;
         int cellID = 0;

         for (Object obj : objectArr)
         {
            Cell cell = row.createCell (cellid++);
            int count = 0;
            switch (rowid)
            {
            case 1:
            case 2:
               if(cellID == 0)
               {
                  cell.setCellValue ((String) obj);
                  cell.setCellStyle (cellStyle4);
               }
               else
               {
                  //value is ArrayList
                  if(obj instanceof ArrayList<?>)
                  {
                     setCellValueFromArrayList(row, cell, obj, headerStyle, cellid);
                     break;
                  }
                  // value is String
                  else
                  {
                     cell.setCellValue ((String) obj);
                  }
                  cell.setCellStyle (headerStyle);
               }
               break;
            case 3:
               if(cellID == 0)
               {
                  if(obj instanceof ArrayList<?>)
                  {
                     setCellValueFromArrayList(row, cell, obj, cellStyle4, cellid);
                     break;
                  }
                  else
                  {
                     cell.setCellValue ((String) obj);
                  }
                  cell.setCellStyle (cellStyle4);
               }
               else
               {
                  if(obj instanceof ArrayList<?>)
                  {
                     setCellValueFromArrayList(row, cell, obj, cellStyle, cellid);
                     break;
                  }
                  else
                  {
                     cell.setCellValue ((String) obj);
                  }
                  cell.setCellStyle (cellStyle);
               }
               break;
            case 4:
               if(obj instanceof ArrayList<?>)
                  {
                     setCellValueFromArrayList(row, cell, obj, cellStyle2, cellid);
                     break;
                  }
                  else
                  {
                     cell.setCellValue ((String) obj);
                  }
               cell.setCellStyle (cellStyle2);
               break;
            default:
               if(cellID == 0)
               {
                  cell.setCellValue ((String) obj);
                  cell.setCellStyle (cellStyle4);
               }
               else
               {
                  if(obj instanceof ArrayList<?>)
                  {
                     setCellValueFromArrayList(row, cell, obj, cellStyle3, cellid);
                     break;
                  }
                  else
                  {
                     cell.setCellValue ((String) obj);
                  }
                  cell.setCellStyle (cellStyle3);
               }
               break;
            }
            cellID++;
         }
      }
      // MPLog.dbg("Data written into the sheets");
//------------------------------------------------------------------------------------------

      // writing the workbook into the file...
      FileOutputStream out = null;
      // MPLog.dbg("Try to write workbook into the file");
      try
      {
         // MPLog.dbg("Workbook written into the file");
         out = new FileOutputStream (new File (users.get (current).excelFileURL));
      } catch (FileNotFoundException e)
      {
         // MPLog.err("Could not write workbook into the file");
         throw new RuntimeException (e);
      }
      workbook.write (out);
      out.close ();
   }

//==========================================================================================
//                *** COUNT LAST KEY FROM LIST AND RETURN NEXT KEY ***
//==========================================================================================

   private  Map<String, Object[]> parseFirstData (int current)
   {
      // MPLog.dbg("Try to parse first 5 rows to List");
      Map<String, Object[]> rowInExcel = new LinkedHashMap<String, Object[]> ();

      List<String> load1stLine = new ArrayList<> ();
      List<String> load2ndLine = new ArrayList<> ();
      List<String> load3rdLine = new ArrayList<> ();
      List<String> load4thLine = new ArrayList<> ();
      List<String> load5thLine = new ArrayList<> ();
      load1stLine = load1st (current);
      load2ndLine = load2nd (current);
      load3rdLine = load3rd (current);
      load4thLine = load4th (current);
      load5thLine = load5th (current);

      rowInExcel.put ("1", new Object[]{"", users.get (current).title, load1stLine});
      rowInExcel.put ("2", new Object[]{"", load2ndLine});
      rowInExcel.put ("3", new Object[]{load3rdLine});
      rowInExcel.put ("4", new Object[]{"Dátum", load4thLine});
      rowInExcel.put ("5", new Object[]{timeStamp, load5thLine});
      // MPLog.dbg("first 5 rows added to List");
      return rowInExcel;
   }

   private String nextKey ( Map<String, Object[]> rowInExcel)
   {
      // MPLog.dbg("Try to find next key for List");
      int iKey = 0;
      String key;
      for (Map.Entry<String, Object[]> entry : rowInExcel.entrySet())
         {
         System.out.println(entry.getKey() + ":" + entry.getValue());
         key = entry.getKey ();
         iKey = Integer.parseInt (key);
         }
      iKey++;  //last key++
      // MPLog.dbg("Next key found");
      return String.valueOf (iKey);
   }

//******************************************************************************************
//                               | HELPER METHODS |
//******************************************************************************************
   private int countDevicesAndTelemetriesRatio(int current)
   {
      // MPLog.dbg("Count no of devices and telemetries ratio");
      return countDevicesSize (current) * countTelemetriesSize (current);
   }
   // RETURN NUMBER OF DEVICES
   private int countDevicesSize(int current)
   {
      // MPLog.dbg("Count no of devices");
      var currD = (ArrayList) users.get (current).dat.get (0)[0];
      return currD.size ();
   }

   // RETURN NUMBER OF TELEMETRIES
   private int countTelemetriesSize(int current)
   {
      // MPLog.dbg("Count no of telemetries");
      var currT = (LinkedHashMap) users.get (current).dat.get (0)[2];
      var temp2 = currT.get (0);
      var temp3 =  (ArrayList) temp2;
      return temp3.size ();
   }

   // RETURN TELEMETRY'S VALUE ON SPECIFIC DEVICE
   private String getValue( int current, int devices, int telemetries)
   {
      // MPLog.dbg("Get telemetry value");
      var temp = (LinkedHashMap) users.get (current).dat.get (0)[2];
      var temp2 = temp.get (devices);
      var temp3 =  (ArrayList) temp2;
      var temp4 = (ArrayList) temp3.get (telemetries);
      var temp5 = (BasicTsKvEntry) temp4.get (0);
      String value = temp5.getValue ().toString ();
      return value;
   }

   // RETURN TELEMETRY'S NAME/KEY ON SPECIFIC DEVICE
   private String getKey(int current, int devices, int telemetries)
   {
      // MPLog.dbg("Get telemetry key");
      var temp = (LinkedHashMap) users.get (current).dat.get (0)[2];
      var temp2 = temp.get (devices);
      var temp3 =  (ArrayList) temp2;
      var temp4 = (ArrayList) temp3.get (telemetries);
      var temp5 = (BasicTsKvEntry) temp4.get (0);
      String value = temp5.getKey ().toString ();
      return value;
   }

   // RETURN DEVICE'S NAME
   private String getName( int current, int i)
   {
      // MPLog.dbg("Get device name");
      var temp = (ArrayList) users.get (current).dat.get (0)[1];
      var temp2 = (ArrayList) temp.get (i);
      var temp3 = (BaseAttributeKvEntry) temp2.get (0);
      String value = temp3.getValue ().toString ();
      return value;
   }

//============================================================
//            *** METHODS FOR LOAD FIRST 5 ROWS ***
//============================================================
   private List<String> load1st(int current)
   {
      int ratio = countDevicesAndTelemetriesRatio(current);
      List<String> load1stLine = new ArrayList<> ();
      for(int i = 0; i < ratio -1 ; i++)
      {
         load1stLine.add ("");
      }
      return load1stLine;
   }
   private List<String> load2nd(int current)
   {
      int devSize = countDevicesSize (current);
      List<String> load2ndLine = new ArrayList<> ();
      for(int i = 0; i < devSize ; i++)
      {
         load2ndLine.add (getName (current, i));
         for (int j = 0; j < countTelemetriesSize (current) - 1; j++)
         {
            load2ndLine.add ("");
         }
      }
      return load2ndLine;
   }
   private List<String> load3rd(int current)
   {
      int ratio = countDevicesAndTelemetriesRatio(current);
      List<String> load3rdLine = new ArrayList<> ();
      for(int i = 0; i < ratio + 1 ; i++)
      {
         load3rdLine.add ("");
      }
      return load3rdLine;
   }
   private List<String> load4th(int current)
   {
      int devSize = countDevicesSize (current);
      int telSize = countTelemetriesSize (current);
      List<String> load4thLine = new ArrayList<> ();
      for(int i = 0; i < devSize ; i++)
      {
         for(int k = 0; k < telSize ; k++)
         {
            load4thLine.add (getKey (current,i,k));
         }
      }
      return load4thLine;
   }
   private List<String> load5th(int current)
   {
      int devSize = countDevicesSize (current);
      int telSize = countTelemetriesSize (current);
      List<String> load5thLine = new ArrayList<> ();
      for(int i = 0; i < devSize ; i++)
      {
         for(int k = 0; k < telSize ; k++)
         {
            load5thLine.add (getValue (current,i,k));
         }
      }
      return load5thLine;
   }
//============================================================
//============================================================

   // CHECK IF ARRAYLIST NEXT INDEX IS EMPTY
   public boolean indexExists(final ArrayList list, final int index)
   {
      return index >= 0 && index < list.size();
   }

//******************************************************************************************
//                          ||| EXCEL CUSTOMIZING METHODS |||
//******************************************************************************************
   private void setMergeAndColumnWidth(XSSFSheet spreadsheet, int current)
   {
      // MPLog.dbg("Try to merge cells");
      //COLUMN WIDTH
      for (int i = 0; i < countDevicesAndTelemetriesRatio (current)+1; i++)
      {
      spreadsheet.setColumnWidth(i, 4500);
      }
      //MERGE SPECIFIC CELLS
      if (countDevicesSize (current) > 1 || countTelemetriesSize (current) > 1)
         spreadsheet.addMergedRegion(new CellRangeAddress (0,0,1,countDevicesAndTelemetriesRatio (current)));

      if(countTelemetriesSize (current) != 1)
      {
         for (int j = 1; j < 3; j++)
         {
            int firstCol = 1;
            int lastCol = countTelemetriesSize (current);
            for (int i = 0; i < countDevicesSize (current); i++)
            {
               spreadsheet.addMergedRegion(new CellRangeAddress (j,j,firstCol,lastCol));
               lastCol += countTelemetriesSize (current);
               firstCol += countTelemetriesSize (current);

            }
         }
      }
      // MPLog.dbg("Cells merged");
   }

   private void setExcelCellStyle(XSSFCellStyle headerStyle, XSSFCellStyle cellStyle, XSSFCellStyle cellStyle2, XSSFCellStyle cellStyle3,XSSFCellStyle cellStyle4, Color orange, Color green, Font headerFont, Font font)
   {
      // MPLog.dbg("Try to customize cells");
      //HEADER STYLE
      headerFont.setBold (true);
      headerFont.setFontHeight ((short) 240);
      headerStyle.setBorderBottom (BorderStyle.THIN);
      headerStyle.setBorderLeft (BorderStyle.THIN);
      headerStyle.setBorderRight (BorderStyle.THIN);
      headerStyle.setBorderTop (BorderStyle.THIN);
      headerStyle.setAlignment (HorizontalAlignment.CENTER);
      headerStyle.setFillForegroundColor (new XSSFColor (orange, new DefaultIndexedColorMap()));
      headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      headerStyle.setFont (headerFont);
      headerStyle.setAlignment (HorizontalAlignment.CENTER);

      //CELL STYLE BASIC
      cellStyle.setBorderBottom (BorderStyle.THIN);
      cellStyle.setBorderLeft (BorderStyle.THIN);
      cellStyle.setBorderRight (BorderStyle.THIN);
      cellStyle.setBorderTop (BorderStyle.THIN);
      cellStyle.setAlignment (HorizontalAlignment.CENTER);

      //BLACK CELL STYLE
      font.setColor(IndexedColors.WHITE.index);
      font.setFontHeight ((short) 220);
      cellStyle2.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      cellStyle2.setFont (font);
      cellStyle2.setAlignment (HorizontalAlignment.CENTER);

      //THICKER CELL STYLE
      cellStyle3.setBorderBottom (BorderStyle.MEDIUM);
      cellStyle3.setBorderLeft (BorderStyle.MEDIUM);
      cellStyle3.setBorderRight (BorderStyle.MEDIUM);
      cellStyle3.setBorderTop (BorderStyle.MEDIUM);
      cellStyle3.setAlignment (HorizontalAlignment.CENTER);

      //GREEN CELL STYLE
      cellStyle4.setBorderBottom (BorderStyle.THIN);
      cellStyle4.setBorderLeft (BorderStyle.THIN);
      cellStyle4.setBorderRight (BorderStyle.THIN);
      cellStyle4.setBorderTop (BorderStyle.THIN);
      cellStyle4.setAlignment (HorizontalAlignment.CENTER);
      cellStyle4.setFillForegroundColor(new XSSFColor (green, new DefaultIndexedColorMap()));
      cellStyle4.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      cellStyle4.setAlignment (HorizontalAlignment.CENTER);
      // MPLog.dbg("cells customized");
   }

   private void setCellValueFromArrayList(Row row, Cell cell, Object obj, XSSFCellStyle cellStyle, int cellid)
   {
      for (int i = 0; i < ((ArrayList<?>) obj).size (); i++)
      {
      cell.setCellStyle (cellStyle);
      cell.setCellValue ((String) ((ArrayList) obj).get (i).toString ());
      if(indexExists( (ArrayList) obj, i+1))
         cell = row.createCell (cellid++);
      }
   }

}
