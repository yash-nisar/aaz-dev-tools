from schematics.models import Model
from schematics.types import StringType, ModelType
from .contact import Contact
from .license import License
from .types import XmsCodeGenerationSettingsType


class Info(Model):
    """The object provides metadata about the API. The metadata can be used by the clients if needed, and can be presented in the Swagger-UI for convenience."""

    title = StringType(required=True)       # The title of the application.
    version = StringType(required=True)     # Provides the version of the application API (not to be confused with the specification version)
    description = StringType()  # A short description of the application
    termsOfService = StringType()  # The Terms of Service for the API.
    contact = ModelType(Contact)  # The contact information for the exposed API.
    license = ModelType(License)  # The license information for the exposed API.

    # specific properties
    _x_ms_code_generation_settings = XmsCodeGenerationSettingsType()  # Deprecated
