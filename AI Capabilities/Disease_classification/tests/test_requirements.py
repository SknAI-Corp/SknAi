# """
# Unit test to verify all packages listed in requirements.txt are installed.
# """

# import importlib
# import pytest
# import re

# def parse_package_name(requirement_line):
#     # Extract just the package name (e.g. "torch" from "torch>=1.10")
#     return re.split(r'[<>=]', requirement_line.strip())[0].lower()

# def get_required_packages():
#     with open("requirements.txt", "r") as f:
#         lines = f.readlines()
#     packages = []
#     for line in lines:
#         line = line.strip()
#         if not line or line.startswith("#"):
#             continue
#         packages.append(parse_package_name(line))
#     return packages

# @pytest.mark.parametrize("package", get_required_packages())
# def test_import_requirements(package):
#     """
#     Checks if each package from requirements.txt can be imported.
#     """
#     try:
#         importlib.import_module(package)
#     except ModuleNotFoundError:
#         pytest.fail(f"Required package '{package}' is not installed.")
