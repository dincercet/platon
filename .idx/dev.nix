{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.openssl
  ];

  services.mysql = {
    enable = true;
    package = pkgs.mysql80;
  };

  idx.workspace.onCreate = {
    npm-install = "npm install";
    prisma-migrate = "prisma migrate dev --name init";
  };

 /* idx.workspace.onStart = {
    npm-run-dev = "npm run dev";
  };
*/
  idx.extensions = [];

  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "-p"
          "$PORT"
        /*  "--host"
          "0.0.0.0"
          "--disable-host-check"*/
        ];
        manager = "web";
      };
    };
  };
}