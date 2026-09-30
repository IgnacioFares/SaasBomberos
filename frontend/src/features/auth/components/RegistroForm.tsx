import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import type { RegisterRequest } from '../types'
import { GRUPOS_SANGUINEOS, RANGOS } from '../../bomberos/constants'
import { LARGO_MAXIMO, LARGO_MINIMO, cumpleTodo } from '../politicaPassword'
import RequisitosPassword from './RequisitosPassword'

interface Props {
  onRegistrar: (datos: RegisterRequest) => void
  loading: boolean
  error: string | null
}

const RegistroForm = ({ onRegistrar, loading, error }: Props) => {
  const [repetirPassword, setRepetirPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [form, setForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    bombero: {
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      rango: '',
      telefonoEmergencia: '',
      obraSocial: '',
      enfermedades: '',
      grupoSanguineo: '',
    },
  })

  const handleChangeUsuario = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleChangeBombero = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      bombero: { ...form.bombero, [e.target.name]: e.target.value },
    })
  }

  // La contraseña no puede armarse con los datos de la propia persona,
  // así que la validación necesita verlos.
  const datosPersonales = {
    email: form.email,
    nombre: form.bombero.nombre,
    apellido: form.bombero.apellido,
    dni: form.bombero.dni,
  }
  const coinciden = form.password === repetirPassword
  const passwordValida = cumpleTodo(form.password, datosPersonales)
  const puedeEnviar = passwordValida && coinciden && !loading

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!puedeEnviar) return
    onRegistrar({ ...form, bombero: { ...form.bombero, email: form.email } })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Box>
        <Typography variant="subtitle2" className="mb-2! font-semibold!" color="text.secondary">
          Datos de acceso
        </Typography>
        <Box className="flex flex-col gap-4">
          <TextField
            name="email"
            type="email"
            label="Email de acceso"
            value={form.email}
            onChange={handleChangeUsuario}
            required
            fullWidth
            helperText="Te vamos a mandar un código a esta dirección para verificarla"
          />
          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="password"
              type={verPassword ? 'text' : 'password'}
              label="Contraseña"
              value={form.password}
              onChange={handleChangeUsuario}
              required
              fullWidth
              // Con el campo vacío no hay checklist que mostrar, así que
              // la regla va acá: si no, el botón queda gris sin motivo
              // visible.
              helperText={
                form.password.length === 0
                  ? `Mínimo ${LARGO_MINIMO} caracteres, con mayúscula, minúscula y número`
                  : ' '
              }
              slotProps={{
                htmlInput: { minLength: LARGO_MINIMO, maxLength: LARGO_MAXIMO },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setVerPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {verPassword ? (
                          <VisibilityOffRoundedIcon fontSize="small" />
                        ) : (
                          <VisibilityRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              name="repetirPassword"
              type={verPassword ? 'text' : 'password'}
              label="Repetir contraseña"
              value={repetirPassword}
              onChange={(e) => setRepetirPassword(e.target.value)}
              required
              fullWidth
              error={repetirPassword.length > 0 && !coinciden}
              helperText={
                repetirPassword.length > 0 && !coinciden ? 'Las contraseñas no coinciden' : ' '
              }
            />
          </Box>

          <RequisitosPassword password={form.password} datos={datosPersonales} />
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" className="mb-2! font-semibold!" color="text.secondary">
          Datos personales
        </Typography>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="nombre"
            label="Nombre"
            value={form.bombero.nombre}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="apellido"
            label="Apellido"
            value={form.bombero.apellido}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="dni"
            label="DNI"
            value={form.bombero.dni}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="telefono"
            label="Teléfono"
            value={form.bombero.telefono}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="rango"
            label="Rango"
            select
            value={form.bombero.rango}
            onChange={handleChangeBombero}
            required
            fullWidth
            className="sm:col-span-2"
          >
            {RANGOS.map((rango) => (
              <MenuItem key={rango} value={rango}>
                {rango}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" className="mb-2! font-semibold!" color="text.secondary">
          Datos médicos y de emergencia
        </Typography>
        <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="telefonoEmergencia"
            label="Teléfono de emergencia"
            placeholder="A quién llamar ante un accidente"
            value={form.bombero.telefonoEmergencia}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="grupoSanguineo"
            label="Grupo sanguíneo"
            select
            value={form.bombero.grupoSanguineo}
            onChange={handleChangeBombero}
            required
            fullWidth
          >
            {GRUPOS_SANGUINEOS.map((grupo) => (
              <MenuItem key={grupo} value={grupo}>
                {grupo}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="obraSocial"
            label="Obra social"
            value={form.bombero.obraSocial}
            onChange={handleChangeBombero}
            required
            fullWidth
          />
          <TextField
            name="enfermedades"
            label="Enfermedades / alergias"
            placeholder="Dejar vacío si no tenés"
            value={form.bombero.enfermedades}
            onChange={handleChangeBombero}
            fullWidth
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={!puedeEnviar}
        fullWidth
        className="py-2.5!"
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </Button>
    </Box>
  )
}

export default RegistroForm
