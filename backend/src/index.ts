import { Elysia } from "elysia";
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

app.get("/Detail_Car", async () => {
  try {
    const res = await pool.request().query(`SELECT * FROM Detail_Car`);

    return res.recordset;
  } catch (error) {
    console.error(error);
  }
});

app.post("/Record_Car", async ({ body }) => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );

  const yyyy = now.getFullYear();
  const mm = Number(now.getMonth());
  const dd = Number(now.getDate());
  const hh = Number(now.getHours());
  const min = Number(now.getMinutes());
  const ss = Number(now.getSeconds());

  const timezone = new Date(Date.UTC(yyyy, mm, dd, hh, min, ss));

  try {
    const CheckCar = await pool
      .request()
      .input("Car_Registration", sql.VarChar, `%${body.car}%`)
      .query(
        `SELECT * FROM Detail_Car WHERE Car_Registration LIKE @Car_Registration`
      );

    if (
      CheckCar.recordset.length > 0 &&
      CheckCar.recordset[0]?.Number_Mile_Out <= Number(body.number_Mile)
    ) {
      const res = await pool
        .request()
        .input("Car_Registration", sql.VarChar, body.car)
        .query(`DELETE Detail_Car WHERE Car_Registration = @Car_Registration`);

      await pool
        .request()
        .input("ID_Car", sql.Int, CheckCar.recordset[0].ID)
        .input("Car_Registration", sql.VarChar, body.car)
        .input("Number_Mile_In", sql.Float, body.number_Mile)
        .input("In_Time", sql.DateTime, timezone)
        .query(
          `UPDATE [Log] SET Number_Mile_In = @Number_Mile_In, In_Time = @In_Time WHERE Car_Registration = @Car_Registration AND ID_Car = @ID_Car`
        );

      return res;
    } else if (
      CheckCar.recordset[0]?.Number_Mile_Out > Number(body.number_Mile)
    ) {
      return { status: 500, message: "Failed" };
    } else {
      const res = await pool
        .request()
        .input("Car_Registration", sql.VarChar, body.car)
        .input("Number_Mile_Out", sql.Float, body.number_Mile)
        .input("Out_Time", sql.DateTime, timezone)
        .query(
          `INSERT INTO Detail_Car (Car_Registration, Out_Time, Number_Mile_Out) VALUES (@Car_Registration, @Out_Time, @Number_Mile_Out) `
        );

      const ID_Car = await pool
        .request()
        .input("Car_Registration", sql.VarChar, `%${body.car}%`)
        .query(
          `SELECT * FROM Detail_Car WHERE Car_Registration LIKE @Car_Registration`
        );

      await pool
        .request()
        .input("ID_Car", sql.Int, ID_Car.recordset[0].ID)
        .input("Car_Registration", sql.VarChar, body.car)
        .input("Number_Mile_Out", sql.Float, body.number_Mile)
        .input("Out_Time", sql.DateTime, timezone)
        .query(
          `INSERT INTO [Log] (Car_Registration, Out_Time, Number_Mile_Out, ID_Car) VALUES (@Car_Registration, @Out_Time, @Number_Mile_Out, @ID_Car) `
        );

      return res;
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(3005);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
