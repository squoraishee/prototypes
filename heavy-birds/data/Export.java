import com.healthmarketscience.jackcess.*;
import java.io.*;
import java.util.*;

public class Export {
  static String esc(Object v) {
    if (v == null) return "";
    String s = v.toString();
    if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r"))
      return "\"" + s.replace("\"", "\"\"") + "\"";
    return s;
  }
  public static void main(String[] a) throws Exception {
    Database db = new DatabaseBuilder(new File(a[0])).setReadOnly(true).open();
    Table t = db.getTable("STRIKE_REPORTS");
    List<String> cols = new ArrayList<>();
    for (Column c : t.getColumns()) if (c.getType() != DataType.OLE && c.getType() != DataType.COMPLEX_TYPE) cols.add(c.getName());
    try (PrintWriter w = new PrintWriter(new BufferedWriter(new OutputStreamWriter(new FileOutputStream(a[1]), "UTF-8")))) {
      w.println(String.join(",", cols));
      int n = 0;
      for (Row r : t) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cols.size(); i++) { if (i > 0) sb.append(','); sb.append(esc(r.get(cols.get(i)))); }
        w.println(sb); n++;
      }
      System.out.println(n + " rows, " + cols.size() + " cols");
    }
  }
}
