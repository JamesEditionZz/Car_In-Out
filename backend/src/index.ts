import { Elysia, status } from "elysia";
import sql from "mssql";
import { cors } from "@elysiajs/cors";

const app = new Elysia().use(cors({ origin: "*" }));

const config: sql.config = {
  user: "sa",
  password: "P@55w0rd",
  server: "192.168.199.20",
  database: "dbScan_IN_OUT",
  options: {
    encrypt: true, // ต้องเปิดถ้ามีการบังคับใช้ SSL
    trustServerCertificate: true, // ✅ ตัวนี้คือคำตอบของ error ที่คุณเจอ
  },
};

const pool = await sql.connect(config);

app.get("/API/Detail_Car", async () => {
  const result = await pool.request().query("SELECT * FROM Detail_Car");
  return result.recordset;
});

app.post("/API/Record_Car", async ({ body }) => {
  try {
    const [d, m, y] = body.date.split("/");
    const [hh, mm, ss] = body.time.split(":");

    const year = Number(y) - 543;
    const month = Number(m).toString().padStart(2, "0");
    const day = Number(d).toString().padStart(2, "0");

    const hour = Number(hh).toString().padStart(2, "0");
    const minute = Number(mm).toString().padStart(2, "0");
    const second = Number(ss).toString().padStart(2, "0");

    const thaiTimeWithOffset = `${year}-${month}-${day} ${hour}:${minute}:${second} +07:00`;

    if (body.numberIn != "") {
      const result = await pool
        .request()
        .input("Car_Registration", sql.VarChar, body.carRegister)
        .input("In_Time", sql.DateTimeOffset, thaiTimeWithOffset)
        .input("Number_Mile_In", sql.Float, body.numberIn)
        .query(
          "UPDATE Detail_Car SET In_Time = @In_Time, Number_Mile_In = @Number_Mile_In WHERE Car_Registration = @Car_Registration"
        );

      return result.recordset;
    } else if (body.numberOut != "") {
      
      const name = body.namePerson.replaceAll(/,\s*/g, "|");

      const CheckCar_Regis = await pool
        .request()
        .input("Car_Registration", sql.VarChar, body.carRegister)
        .query(
          "SELECT * FROM Detail_Car WHERE Car_Registration = @Car_Registration AND Number_Mile_In IS NULL"
        );

      if (CheckCar_Regis.recordset.length === 0) {
        const result = await pool
          .request()
          .input("Project", sql.VarChar, body.Project)
          .input("Car_Registration", sql.VarChar, body.carRegister)
          .input("Out_Time", sql.DateTimeOffset, thaiTimeWithOffset)
          .input("Number_Mile_Out", sql.Float, body.numberOut)
          .input("Name", sql.VarChar, name)
          .query(
            "INSERT INTO Detail_Car (Project, Car_Registration, Out_Time, Number_Mile_Out, Name)  VALUES (@Project, @Car_Registration, @Out_Time, @Number_Mile_Out, @Name)"
          );

        return result.recordset;
      } else {
        return status(400, { message: "Car already checked in" });
      }
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(3005);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
