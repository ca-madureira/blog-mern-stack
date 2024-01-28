import { openUploadWidget } from "../utils/CloudinaryService";

import { useState } from "react";

const CloudinaryUpload = () => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const uploadImageWidget = () => {
    let myUploadWidget = openUploadWidget(
      {
        cloudName: "dsrwye3fj",
        uploadPreset: "blog-banner",
        sources: ["local"],
      },
      function (error, result) {
        if (!error && result.event === "success") {
          setUrl(result.info.secure_url);
          setName(result.info.original_filename);
        } else {
          if (error) {
            console.log(error);
          }
        }
      }
    );
    myUploadWidget.open();
  };
};

export default CloudinaryUpload;
