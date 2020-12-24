import GoogleSearchController from '../../controllers/googleSearchController';

function main() {
  const googleSearchController = new GoogleSearchController();
  googleSearchController.askGoogle(1, 200);
}

main();
