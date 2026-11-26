
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import ApiStatus from './components/ApiStatus';

const navigation = [
  { name: 'Inicio', path: '/' },
  { name: 'Comparativa', path: '/comparativa' },
  { name: 'Constructor', path: '/constructor' },
  { name: 'Simulador', path: '/simulador' },
  { name: 'Ejercicios', path: '/ejercicios' },
];

function Comparativa() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Próximamente
      </span>

      <h1 className="mt-3 text-2xl font-bold text-slate-800">
        Comparativa de modelos
      </h1>

      <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
        En este espacio podrás comparar el comportamiento y las
        características de los modelos de cómputo formal.
        Esta herramienta estará disponible en una próxima actualización.
      </p>
    </section>
  );
}

function Inicio() {
  const modules = [
    {
      title: 'Constructor',
      description: 'Diseña y trabaja con gramáticas formales.',
      path: '/constructor',
    },
    {
      title: 'Simulador',
      description: 'Explora el comportamiento de los modelos.',
      path: '/simulador',
    },
    {
      title: 'Ejercicios',
      description: 'Refuerza tus conocimientos mediante prácticas.',
      path: '/ejercicios',
    },
  ];

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-indigo-600 p-8 text-white shadow-sm sm:p-12">
        <span className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
          Plataforma educativa
        </span>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Bienvenido a GrammaLab
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-indigo-100">
          Aprende, construye y practica conceptos de gramáticas
          formales y teoría de la computación.
        </p>

        <Link
          to="/constructor"
          className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Comenzar a explorar
        </Link>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800">
            Explora las herramientas
          </h2>
          <p className="mt-1 text-slate-500">
            Selecciona el espacio que deseas consultar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                
              </span>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                {module.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {module.description}
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-indigo-600 group-hover:underline">
                Explorar →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Constructor() {
  return <h1 className="text-2xl font-bold">Constructor de gramáticas</h1>;
}

function Simulador() {
  return <h1 className="text-2xl font-bold">Simulador</h1>;
}

function Ejercicios() {
  return <h1 className="text-2xl font-bold">Ejercicios</h1>;
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              G
            </span>

            <span>
              <span className="block text-xl font-bold text-slate-900">
                GrammaLab
              </span>
              <span className="block text-xs text-slate-500">
                Aprende. Construye. Comprende.
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <ApiStatus />
        </nav>
      </header>

      <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-6 py-10">
        <Routes>
          <Route path="/comparativa" element={<Comparativa />} />
          <Route path="/" element={<Inicio />} />
          <Route path="/constructor" element={<Constructor />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route
            path="*"
            element={
              <div className="py-20 text-center">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="mt-2 text-slate-500">
                  No encontramos esta página.
                </p>
                <Link to="/" className="mt-4 inline-block text-indigo-600">
                  Volver al inicio
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-sm text-slate-500">
        GrammaLab · Plataforma educativa de teoría de la computación
      </footer>
    </div>
  );
}

export default App;
