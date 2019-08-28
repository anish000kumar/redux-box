# Getting Started with baked
Demo of how to set up Baked applications at [Broadcast](https://broadcast.amazon.com/videos/69573)

## Initial asset package setup
1. If you already have setup Octane on your dev desktop and can use `brazil-octane` from the command line then jump to step 2, otherwise:
    - Go to [OctaneBrazilTool](https://apollo.amazon.com/environments/OctaneBrazilTools/) and create your 1-click child env, then sync your 1-click child  env from Prod, and in the end create an alias for brazil-octane pointing to `/apollo/env/OctaneBrazilTools/bin/brazil-octane.`
    More details about how to to all this at [Octane_CLI#Deploying_the_Octane_CLI](https://w.amazon.com/index.php/)

2. Go to [version-set tool](https://code.amazon.com/version-sets/new) and create a new version set for your web application assets. If your project is named `Foo` you can name it something like `FooAssets/mainline`, the source version set should be live.
On your dev desktop create a workspace for your new project using the version set you just created:
    ```
    brazil ws create --name FooProject --versionset FooAssets/mainline
    cd FooProject
    ```
3. In your newly created workspace generate a new package that will contain the assets for your web application, in this example we use react, but you can pick whatever you'd like as the framework:
    ```
    brazil-octane package generate baked --help # to see what options are available
    ```
    
    ```
    brazil-octane package generate baked --name FooAssets --framework react # if you'd like other frameworks please look in the help to see the available options
    ```

    **Possible Error:** `The cloud-desktop CLI is not install or not in $PATH. For more details see https://w.amazon.com/bin/view/Octane_CLI/OSX_Support/#HPrerequisites`
    
    **Solution:** You might be running on localhost. The command should work fine for dev desktop, if you jave step 1 covered:

    ```
    cd src/FooAssets
    ```
    Promote the newly created package to Brazil with something like:
    ```
    brazil-octane pkg promote --help # to see what options are available`
    ```
    ```
    brazil-octane pkg promote --bindleName YOUR_BINDLE --push # to promote the package
    ```
4. Your package is available for everybody to use now, you can continue doing development on your dev desktop or switch to your laptop and check out the new project on your laptop, with:
    ```
    brazil ws use -p FooAssets
    ```
You can run `brazil-build help` to see a list of Baked build commands available through `brazil-build` command.
**Note1:** To be able to use `HappyNPM` with the assets package, ensure 

**Note2:** If you adjust the Webpack configuration please keep in mind that the bundled resources emitted by Webpack need to have filenames which include a hash of the content. This comes by default with the Octane generated package so you'll get it for free. Hashes in filenames are needed for all resources that can change, this includes JS, CSS, images, fonts resources (if their content may change). The following are the reasons why a hash in the filename is required: 1) when the users will access the website their browser will not get the latest content if the filename is not including a hash as the browser will serve a cache version up until the expiration date set by CDN, 2) CDN itself caches resources and trying to update resources using same name reports success on CDN side, but is not visible in the resource up until the CDN system refreshes the resource with the new content, which can take time.

## Setting up the VersionSet
- Open VersionSet page and click "Merge In Packages": `https://code.amazon.com/version-sets/FooAssets/mainline`
- Keep "Yes. Merge from TIP of live" and add packages in your Config file (Currently, BakedBuild-1.0 and NodeJS-jquery-3.2.x)
- Unselect "Import a new Apollo Version Filter Instance" and submit merge build request
- Go to your workspace and sync VS changes: 
    ```brazil ws sync --md```
- Follow Fixing an NPM dependency problem section below:
     Go to [https://build.amazon.com/](https://build.amazon.com/) and build FooAssets package into FooAssets/mainline VS (select "Mark as target")

## Setting up the pipelines
Baked decouples front-end assets from backend code such that you can have independent deployments and you can control independently the assets from your backend code. The way this is achieved is by having 2 pipelines, one pipeline for your backend code and another pipeline for your front-end assets.

### Setting up the assets pipeline
- The assets pipeline will only serve to automatically upload the assets to CDN and make them available in to be injected in the web application, it will not serve user traffic and as such only requires 1 host per environment.

- It's possible to setup the pipeline such that one Apollo environment stage is responsible to push to CDN and make the assets available to any number of regions and domains, usually it's recommended to make use of Beta, Gamma and Prod as you can control where the assets are pushed and have better QA process, but alternatively it's also supported to push for example assets to Beta and Gamma at the same time from a single Apollo environment stage.

- Assuming you have the version set you created at the Initial asset package setup section above, please add your assets package to be the target of the version set if you haven't done already:
    ```
    brazil vs --addtargets -vs FooAssets/mainline -p FooAssets-1.0
    ```
- Manually or using Live Pipeline Templates create a pipeline with Apollo environment for the assets version set FooAssets/mainline
Setup 1 host per Apollo environment stage (including prod), it doesn't serve real user traffic and 1 host is enough.
On the Apollo environment stages please configure the appropriate PubSub configuration.
On the Apollo environment stages add Baked operational configuration group and setup the following:
    ```
    BakedReleaseRealms - comma separated list of realms where you'd like the assets to be available (e.g. USAmazon,EUAmazon)
    BakedReleaseDomains - comma separated list of domains where you'd like the assets to be available (e.g. test,master)
    BakedReleasePackages - comma separated list of packages you'd like to release on those realms and domains (e.g. FooAssets)
    ```
- Now every time you push your changes for your assets package they should go through the pipeline, build in Brazil, go through Apollo and reach CDN and be made available on the respective realms and domains where you specified. If you'd like to revert the assets deployment then please do an Apollo rollback and the assets for the configured BakedReleaseRealms and BakedReleaseDomains where you do the rollback will be rolled back.

Note: as soon as the assets are reaching a realm/domain they will be available automatically for your web application running on that domain/realm by accessing them from CDN.

### Setting up the Horizonte pipeline
- Use your already existing Horizonte pipeline (or create one if you need it from scratch).
- Import in the version set where you have Horizonte the following package: BakedHorizonteInjector
- Add in your Horizonte Config a dependency (in your dependencies section) on BakedHorizonteInjector
- Setup your Spring configuration such that BakedSpringConfiguration is loaded in your Spring context. For Horizonte 5 this can be easily done by adding BakedSpringConfiguration.class to your CustomRootConfig (in the @Import annotation).
- On the controllers that are serving your web application HTML please add the following annotation:
    ``` java
    @BakedApplication("FooAssets-1.0") 
    ```
assuming that FooAssets is your assets package and has the 1.0 major version.
- In your JSP or FreeMarker template add a taglib for Baked. For Horizonte 5 with JSP you can go to the JSP file that's serving your HTML (e.g. home.jsp by default for the home page) and add the following <%@ taglib uri="amazon-baked-tags" prefix="baked" %>
In the same JSP as in the previous step add <baked:inject_application_styles/> where you'd like your styles to be injected, usually the preferred location is in the head.
- In the same JSP as in the previous step add <baked:inject_application_scripts/> where you'd like your scripts to be injected, usually the preferred location is at the end of the body.
Now your Horizonte should serve the assets that are available on the specific stage and realm you deployed them to.

By default Baked injects prod version of the assets that have source mappings for easy investigation, if you'd like to serve dev version of the assets instead then on the Horizonte Apollo env please add the operational configuration set BakedInjector with the dev value for BakedInjectorEnvType property.

