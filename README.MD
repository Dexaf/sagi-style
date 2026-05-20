# Sagi style
Sagi style is a repository for the design system used for internal sagitauros studio's application.
As such the package is unlicensed and can't be used without permission.

## Tips
- To read this repo Better I advise using Better Comments by aaron bond and Comment Anchors by ExodiusStudios on VSCodium or Visual Studio Code to have colors and an index of code sections in the plugin tab.

## Maintenance
- The commits will start with words that explains the purpose of the commits, if the commit have more then one purpose use & to add more then one purpose or use only the major purpose if the other modification are of lesser importance
    - __START__: creation of repository.
    - __FEAT__: feature added to the repository.
    - __FIX__: fixed something in the repository.
    - __DOCS__: added comments, doc files or renamed variables to be more explicative.
    - __RFCT__: refactored the structure of code.
    - __RNM__: renamed files.
    - __TEST__: added tests to the repo.
- I hope i'll be able to maintain what i said in the previous point.
- Use early return guard instead of big nested if.
- Throw errors with meaningfull message, specify SFYRI and the name of the method throwing the error with \n after to make a cleaner visualization of the message. 