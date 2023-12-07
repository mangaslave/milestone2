const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
let ejs = require("ejs");
const {formidable} = require("formidable");
const url = require('url');
//const { fileMultiple } = require("./helper");
const isFileValid = (file) => {
    const type = file.type.split("/").pop();
    const validTypes = ["jpg", "jpeg", "png", "pdf"];
    if (validTypes.indexOf(type) === -1) {
      return false;
    }
    return true;
  };

const controller = {
    
  getHomepage: async (request, response) => {
    //request.setHeader(DEFAULT_HEADER);

    const datadir = path.join(__dirname, "..", "database", "data.json");
    const database = await fs.readFile(datadir, "utf8");
    const userArray = JSON.parse(database);
    console.log(userArray);
    //fs readfile to put more users
    const home = await fs.readFile(__dirname, "home.ejs", "utf8");
    const render = ejs.render(home, { users: usersArray });
            
    response.end(render);
  },
  sendFormData: async (request, response) => {
      // parse a file upload
      const username = request.url.split("=")[1];
      
      const form = formidable({ keepExtensions: true });
      form.uploadDir = path.join(__dirname, "..", "src", "photos", username); 
      let fields;
      let files;
      [fields, files] = await form.parse(request);
      response.writeHead(302, {
        'Location': '/'
      });
      response.end();
      return;
  },

  getFeed: async (request, response) => {
    //console.log(request.url); try: http://localhost:3000/feed?username=john123
    //first extract "username=john123" to go to feed that we want 
    const usernameFromURL = request.url.split("=")[1];
    const datadir = path.join(__dirname, "..", "database", "data.json");
    const database = await fs.readFile(datadir, "utf8");
    const userArray = JSON.parse(database);
    const user = userArray.find(user => user.username === usernameFromURL);
    //const pictureDir = path.join(__dirname, "..", "src", "photos", user.username);
    let imageFeed = "";
    const feed = await fs.readFile("./feed.ejs", "utf8");
    const render = ejs.render(feed, { user: userObj[0] });
    
    response.write(render);
    response.end();
},

  uploadImages: async (request, response) => {
    const userArray = JSON.parse(database);
    const form = new formidable.IncomingForm();
    console.log(form);
    const uploadFolder = path.join(__dirname, 'public', 'files');
    form.multiples = true;
    form.maxFileSize = 50 * 1024 * 1024; // 5MB
    form.uploadDir = uploadFolder;

        //console.log(form);
        /*form.parse(request, async (err, fields, files) => {
            if (err) {
              console.log("Error parsing the files");
              return response.status(400).json({
                status: "Fail",
                message: "There was an error parsing the files",
                error: err,
              });
            }
        })*/
        form.parse(request, async (err, fields, files) => {
            console.log(fields);
            console.log(files);
            if (err) {
              console.log("Error parsing the files");
              return response.status(400).json({
                status: "Fail",
                message: "There was an error parsing the files",
                error: err,
              });
            }
            if (!files.myFile.length) {
                //Single file
            
                const file = files.myFile;
            
                // checks if the file is valid
                const isValid = isFileValid(file);
            
                // creates a valid name by removing spaces
                const fileName = encodeURIComponent(file.newFilename.replace(/\s/g, "-"));
            
                if (!isValid) {
                // throes error if file isn't valid
                return response.status(400).json({
                    status: "Fail",
                    message: "The file type is not a valid type",
                });
                }
                try {
                // renames the file in the directory
                let usernamePath = path.join(__dirname, "photos", user.username)
                fs.renameSync(file.path, join(uploadFolder, usernamePath));
                } catch (error) {
                console.log(error);
                }
            
                try {
                // stores the fileName in the database
                const newFile = await File.create({
                    name: `files/${user.username}`,
                });
                return response.status(200).json({
                    status: "success",
                    message: "File created successfully!!",
                });
                } catch (error) {
                response.json({
                    error,
                });
                }
            } else {
                // Multiple files
            }
        });
  },
};

module.exports = controller;
