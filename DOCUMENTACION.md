1. Primero vere que cuenta esta conectada a git en local con:

git config user.name
git config user.email

2. Configurar identidad real

git config --global user.name "Rubén Simón"
git config --global user.email "ruben.sireb@gmail.com"

*Al usar global recordara esta cuenta para futuros proyectos

3. Crear el repositorio en github (La nube)

Abre tu navegador y entra en tu cuenta de GitHub.
Arriba a la derecha, dale al botón + y selecciona New repository.
Rellena los datos así:
    Repository name: saas-logitrack
    Description: ERP B2B para gestión logística y alquiler de hardware.
    Public / Private: Ponlo en Public (queremos que el portafolio sea visible).
¡MUY IMPORTANTE! NO marques las casillas de "Add a README", "Add .gitignore" ni "Choose a license". Queremos que el repositorio se cree completamente vacío para que no haya conflictos con los archivos que ya hemos creado en tu local.
Dale al botón verde Create repository.

4. Conectar el pc conGithub y subir el codigo

* Conectarlo
git remote add origi**n https://github.com/rubensimon1/SaaS-LogicTrack.git**

* Modificar la url si tienes algun problema
git remote set-url origin https://github.com/rubensimon1/SaaS-LogicTrack.git

* Eliminar el remote 
git remote remove origin

* Ver si funciona
git remote -v

* Subir el primer commit
git commit --allow-empty -m "chore: initial commit"

* Renombrar la rama por defecto a main (por estandar actual)
git branch -M main

* Crear la rama de desarrollo (develop) a partir de main
git checkout -b develop