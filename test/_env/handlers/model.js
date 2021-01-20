module.exports = (srv) => {
  const { Header, HeaderStream } = srv.entities("test.MainService");

  srv.on("unboundFunction", async (req) => {
    return {
      code: "TEST",
      name: req.data.text,
      age: req.data.num,
    };
  });

  srv.on("unboundMassFunction", async (req) => {
    // Unwrap collection
    const ids = req.data.ids || JSON.parse(req._.req.query["@idsCol"]).map((id) => id.replace(/^["](.*)["]$/, "$1"));
    return ids.map((id, index) => {
      return {
        code: id,
        name: id,
        age: index,
      };
    });
  });

  srv.on("unboundDecimalFunction", async (req) => {
    return 12345.6789;
  });

  srv.on("unboundDecimalsFunction", async (req) => {
    return [12345.6789, 12345.6789];
  });

  srv.on("unboundErrorFunction", async (req) => {
    const error = new Error("An error occurred");
    error.code = "ERR01";
    error.target = "Items";
    error.message = "An error occurred";
    error.severity = 4;
    error["@Common.numericSeverity"] = 4;
    error.details = [
      {
        code: "ERR02-transition",
        target: "Items",
        message: "Error details",
        "@Common.numericSeverity": 4,
      },
    ];
    req.error(error);
  });

  srv.on("unboundWarningFunction", async (req) => {
    const info1 = new Error("This is a warning");
    info1.code = "WARN01";
    info1.target = "Items";
    info1.message = "An Warning occurred";
    info1.numericSeverity = 3;
    req.info(info1);

    const info2 = new Error("This is another warning");
    info2.code = "WARN02";
    info2.target = "Root";
    info2.message = "Another Warning occurred";
    info2.numericSeverity = 3;
    req.info(info2);

    return {
      name: "Test",
      code: "TEST",
      age: 1,
    };
  });

  srv.on("unboundNavigationFunction", async (req) => {
    return req.run(SELECT.from("test.MainService.Header").where({ ID: req.data.text }));
  });

  srv.on("unboundNavigationsFunction", async (req) => {
    return req.run(SELECT.from("test.MainService.Header"));
  });

  srv.on("unboundAction", async (req) => {
    return [
      {
        code: "TEST",
        name: req.data.text,
        age: req.data.num,
      },
    ];
  });

  srv.on("unboundMassAction", async (req) => {
    return req.data.ids.map((id, index) => {
      return {
        code: id,
        name: id,
        age: index,
      };
    });
  });

  srv.on("boundFunction", Header, async (req) => {
    return [
      {
        code: "TEST",
        name: req.data.text,
        age: req.data.num,
      },
    ];
  });

  srv.on("boundAction", Header, async (req) => {
    return {
      code: "TEST",
      name: req.data.text,
      age: req.data.num,
    };
  });

  srv.on("CREATE", HeaderStream, async (req, next) => {
    if (req.data.filename && req.data.filename.includes("error")) {
      req.error(400, "Filename contains error");
      return;
    }
    await next();
  });
};
