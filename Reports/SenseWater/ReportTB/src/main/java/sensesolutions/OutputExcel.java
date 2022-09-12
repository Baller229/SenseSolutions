package sensesolutions;

// import mplog.MPLog;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import java.io.FileInputStream;
import java.io.File;
import java.util.*;

public class OutputExcel
{
      public static Map<String, Object[]> rowInExcelOutput;

//==========================================================================================
//  *** WILL READ DATA FROM EXCEL, BECAUSE I WANT TO REWRITE THEM +ADD NEW ROW ***
//==========================================================================================
      public Map<String, Object[]> readFromExcel( List<UserData> users, int current, int count)
      {
         // MPLog.dbg("Try to read data from Excel");
         rowInExcelOutput = new LinkedHashMap<String, Object[]> ();
         int cellCount = 0;
         int rowCount = 1;

         try
         {
            FileInputStream file = new FileInputStream(new File (users.get (current).excelFileURL));

            //Create Workbook instance holding reference to .xlsx file
            XSSFWorkbook workbook = new XSSFWorkbook(file);

            //Get first/desired sheet from the workbook
            XSSFSheet sheet = workbook.getSheetAt(0);

            //Iterate through each rows one by one
            Iterator<Row> rowIterator = sheet.iterator();

            while (rowIterator.hasNext())
            {
               Object timeseries[] = new Object[count+1];
               Row row = rowIterator.next();
               //For each row, iterate through all the columns
               Iterator<Cell> cellIterator = row.cellIterator();

               while (cellIterator.hasNext())
               {

                  Cell cell = cellIterator.next();
                  //add value from cell to object array
                  timeseries[cellCount] = cell.getStringCellValue();
                  //move to next value from cell
                  cellCount++;
               }
               rowInExcelOutput.put(String.valueOf (rowCount), timeseries);

               //move to next row
               rowCount++;

               //start from first cell but in next row
               cellCount = 0;
            }
            file.close();
         }
         catch (Exception e) {
            // MPLog.err ("Could not read data from Excel");
            e.printStackTrace();
         }
         // MPLog.dbg("Data read from excel");
         return rowInExcelOutput;
      }
}
