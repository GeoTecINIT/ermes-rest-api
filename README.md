# ERMES: Backend.
This is a repo with the refactor of the original Node server for ERMES.

Temporally available at: [http://lsivirtual11.dlsi.uji.es:6686](http://lsivirtual11.dlsi.uji.es:6686)

### TODO TASKS
* Image is not stored in the model, just the route.
* Improve login/password by enabling password recovery.

### WORK DONE:
* Routes reorganized.
* Languaje added to the user Model.
* When user registers languaje setted to the region one.
* /login response includes the languaje.
* When user is first time registered lastPosition is setted to the Standar Position of the region.
* CORS enabled to all responses.
* Parcel returns, for each prodct, an array of IDs.
* Add Sessions: /api services require session, user logged.
* Add service to change user prefered languaje.

