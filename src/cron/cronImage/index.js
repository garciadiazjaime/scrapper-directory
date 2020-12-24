import GoogleImageController from '../../controllers/googleImageController';

function main() {
  const googleImageController = new GoogleImageController();
  googleImageController.askGoogle(0, 200);
}

main();
