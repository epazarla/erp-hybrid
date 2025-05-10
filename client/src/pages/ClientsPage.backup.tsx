import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  MenuItem, 
  IconButton, 
  Snackbar, 
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { 
  Client, 
  getAllClients, 
  addClient, 
  updateClient, 
  deleteClient, 
  toggleClientStatus,
  SECTORS,
  CLIENTS_UPDATED_EVENT,
  createDemoClients,
  saveClientsToStorage
} from '../services/ClientService';

/**
 * Müşteri Yönetimi Sayfası
 * 
 * Bu sayfa müşteri yönetim sisteminin giriş noktasıdır.
 */
const ClientsPage: React.FC = () => {
  // State tanımlamaları
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>({ 
    name: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    address: '', 
    sector: '', 
    taxNumber: '',
    logo: '',
    website: '',
    notes: '',
    isActive: true,
    monthlyIncome: 0,
    paymentStatus: 'none',
    lastPaymentDate: ''
  });
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tabValue, setTabValue] = useState<number>(0);

  // Müşterileri yükle
  useEffect(() => {
    loadClients();
    
    // Müşteri güncellemelerini dinle
    const handleClientsUpdated = () => {
      console.log('Müşteriler güncellendi, yeniden yükleniyor...');
      loadClients();
    };

    window.addEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
    
    return () => {
      window.removeEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
    };
  }, []);

  // Müşterileri yükle
  const loadClients = () => {
    try {
      const allClients = getAllClients();
      
      // Eğer müşteri yoksa örnek verileri yükle
      if (allClients.length === 0) {
        const demoClients = createDemoClients();
        saveClientsToStorage(demoClients);
      } else {
        setClients(allClients);
        applyFilters(searchQuery, filterSector, filterStatus);
        console.log(`${allClients.length} müşteri yüklendi`);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteriler yüklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Örnek müşteri verilerini geri yükle
  const restoreClientData = () => {
    try {
      const demoClients = createDemoClients();
      const success = saveClientsToStorage(demoClients);
      
      if (success) {
        setClients(demoClients);
        applyFilters(searchQuery, filterSector, filterStatus);
        setSnackbar({
          open: true,
          message: `${demoClients.length} müşteri başarıyla geri yüklendi`,
          severity: 'success'
        });
        return demoClients;
      } else {
        setSnackbar({
          open: true,
          message: 'Müşteri verileri geri yüklenirken bir hata oluştu',
          severity: 'error'
        });
        return [];
      }
    } catch (error) {
      console.error('Müşteri verileri geri yüklenirken bir hata oluştu:', error);
      setSnackbar({
        open: true,
        message: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        severity: 'error'
      });
      return [];
    }
  };

  // Filtreleri uygula
  const applyFilters = (query: string, sector: string, status: string) => {
    let filtered = [...clients];
    
    // Arama filtresi
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(lowerQuery) ||
        client.contactPerson.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery) ||
        client.sector.toLowerCase().includes(lowerQuery) ||
        (client.taxNumber && client.taxNumber.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Sektör filtresi
    if (sector !== 'all') {
      filtered = filtered.filter(client => client.sector === sector);
    }
    
    // Durum filtresi
    if (status !== 'all') {
      const isActive = status === 'active';
      filtered = filtered.filter(client => client.isActive === isActive);
    }
    
    setFilteredClients(filtered);
  };

  // Sayfa değişimi
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Sayfa başına satır sayısı değişimi
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tab değişimi
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Tab değerine göre filtreleme yap
    if (newValue === 0) { // Tüm müşteriler
      setFilterStatus('all');
    } else if (newValue === 1) { // Aktif müşteriler
      setFilterStatus('active');
    } else if (newValue === 2) { // Pasif müşteriler
      setFilterStatus('inactive');
    }
    
    applyFilters(searchQuery, filterSector, newValue === 0 ? 'all' : (newValue === 1 ? 'active' : 'inactive'));
  };

  // Arama sorgusu değişimi
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, filterSector, filterStatus);
  };

  // Sektör filtresi değişimi
  const handleSectorFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sector = e.target.value;
    setFilterSector(sector);
    applyFilters(searchQuery, sector, filterStatus);
  };

  // Yeni müşteri ekleme formunu aç
  const handleOpenAddDialog = () => {
    setEditMode(false);
    setSelectedClient(null);
    setNewClient({ 
      name: '', 
      contactPerson: '', 
      email: '', 
      phone: '', 
      address: '', 
      sector: '', 
      taxNumber: '',
      logo: '',
      website: '',
      notes: '',
      isActive: true,
      monthlyIncome: 0,
      paymentStatus: 'none',
      lastPaymentDate: ''
    });
    setOpenDialog(true);
  };

  // Müşteri düzenleme formunu aç
  const handleOpenEditDialog = (client: Client) => {
    setEditMode(true);
    setSelectedClient(client);
    setNewClient({
      name: client.name,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      sector: client.sector,
      taxNumber: client.taxNumber || '',
      logo: client.logo || '',
      website: client.website || '',
      notes: client.notes || '',
      isActive: client.isActive
    });
    setOpenDialog(true);
  };

  // Form değişikliklerini işle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setNewClient({
      ...newClient,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Müşteri ekle/düzenle
  const handleSaveClient = () => {
    // Form doğrulama
    if (!newClient.name || !newClient.email || !newClient.phone || !newClient.sector) {
      setSnackbar({
        open: true,
        message: 'Lütfen zorunlu alanları doldurun',
        severity: 'error'
      });
      return;
    }

    try {
      if (editMode && selectedClient) {
        // Müşteri güncelle
        const updatedClient = updateClient({
          ...selectedClient,
          ...newClient
        });

        if (updatedClient) {
          setSnackbar({
            open: true,
            message: 'Müşteri başarıyla güncellendi',
            severity: 'success'
          });
          setOpenDialog(false);
          loadClients();
        } else {
          setSnackbar({
            open: true,
            message: 'Müşteri güncellenirken bir hata oluştu',
            severity: 'error'
          });
        }
      } else {
        // Yeni müşteri ekle
        const result = addClient(newClient);
        
        if (result) {
          setSnackbar({
            open: true,
            message: 'Müşteri başarıyla eklendi',
            severity: 'success'
          });
          
          // Formu sıfırla
          setNewClient({ 
            name: '', 
            contactPerson: '', 
            email: '', 
            phone: '', 
            address: '', 
            sector: '', 
            taxNumber: '',
            logo: '',
            website: '',
            notes: '',
            isActive: true
          });
          
          setOpenDialog(false);
          loadClients();
        } else {
          setSnackbar({
            open: true,
            message: 'Müşteri eklenirken bir hata oluştu',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Müşteri kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri kaydedilirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Müşteri silme diyaloğunu aç
  const handleOpenDeleteDialog = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  // Müşteri sil
  const handleDeleteClient = () => {
    if (!clientToDelete) return;
    
    try {
      const result = deleteClient(clientToDelete);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Müşteri başarıyla silindi',
          severity: 'success'
        });
        
        setDeleteDialogOpen(false);
        setClientToDelete(null);
        loadClients();
      } else {
        setSnackbar({
          open: true,
          message: 'Müşteri silinirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Müşteri silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri silinirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Müşteri durumunu değiştir (aktif/pasif)
  const handleToggleStatus = (client: Client) => {
    try {
      const result = toggleClientStatus(client.id, !client.isActive);
      
      if (result) {
        setSnackbar({
          open: true,
          message: `Müşteri durumu ${!client.isActive ? 'aktif' : 'pasif'} olarak güncellendi`,
          severity: 'success'
        });
        
        loadClients();
      } else {
        setSnackbar({
          open: true,
          message: 'Müşteri durumu güncellenirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Müşteri durumu güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri durumu güncellenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };
  
  // Ödeme durumunu güncelle
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [clientToUpdatePayment, setClientToUpdatePayment] = useState<Client | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'overdue' | 'none'>('none');
  
  // Ödeme diyaloğunu aç
  const handleOpenPaymentDialog = (client: Client) => {
    setClientToUpdatePayment(client);
    setPaymentAmount(client.monthlyIncome || 0);
    setPaymentStatus(client.paymentStatus || 'none');
    setPaymentDialogOpen(true);
  };
  
  // Ödeme diyaloğunu kapat
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setClientToUpdatePayment(null);
  };
  
  // Ödeme bilgilerini kaydet
  const handleSavePayment = () => {
    if (!clientToUpdatePayment) return;
    
    try {
      const updatedClient = {
        ...clientToUpdatePayment,
        monthlyIncome: paymentAmount,
        paymentStatus: paymentStatus,
        lastPaymentDate: paymentStatus === 'paid' ? new Date().toISOString() : clientToUpdatePayment.lastPaymentDate
      };
      
      const result = updateClient(updatedClient);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Ödeme bilgileri başarıyla güncellendi',
          severity: 'success'
        });
        
        handleClosePaymentDialog();
        loadClients();
      } else {
        setSnackbar({
          open: true,
          message: 'Ödeme bilgileri güncellenirken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Ödeme bilgileri güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Ödeme bilgileri güncellenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Diyalog kapat
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Silme diyaloğunu kapat
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box className="centered-content clients-page" sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 2
    }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Müşteri Yönetimi
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3, p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Müşteri Yönetimi
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={restoreClientData}
              sx={{ mr: 2 }}
            >
              Örnek Müşterileri Geri Yükle
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Yeni Müşteri Ekle
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Müşteri Ara..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: '300px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <Box>
            <TextField
              select
              label="Sektör"
              value={filterSector}
              onChange={handleSectorFilterChange}
              />
          </Box>
        </Box>
      
      <Tabs
        value={tabValue}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label={`Tüm Müşteriler (${clients.length})`} />
        <Tab label={`Aktif Müşteriler (${clients.filter(c => c.isActive).length})`} />
        <Tab label={`Pasif Müşteriler (${clients.filter(c => !c.isActive).length})`} />
      </Tabs>
      
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Firma Adı</TableCell>
              <TableCell>İletişim Kişisi</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Sektör</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={client.logo || undefined} 
                          sx={{ mr: 2, bgcolor: client.isActive ? 'primary.main' : 'grey.500' }}
                        >
                          {client.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body1">{client.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.sector} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={client.isActive ? 'Aktif' : 'Pasif'} 
                        size="small" 
                        color={client.isActive ? 'success' : 'default'} 
                      />
                    </TableCell>
                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(client)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ödeme Bilgileri">
                        <IconButton 
                          size="small" 
                          color="info" 
                          onClick={() => handleOpenPaymentDialog(client)}
                        >
                          <MonetizationOnIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={client.isActive ? 'Pasife Al' : 'Aktife Al'}>
                        <IconButton 
                          size="small" 
                          color={client.isActive ? 'default' : 'success'} 
                          onClick={() => handleToggleStatus(client)}
                        >
                          {client.isActive ? 
                            <VisibilityOffIcon fontSize="small" /> : 
                            <VisibilityIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(client.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="subtitle1">Gösterilecek müşteri bulunamadı.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Tabs
        value={tabValue}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label={`Tüm Müşteriler (${clients.length})`} />
        <Tab label={`Aktif Müşteriler (${clients.filter(c => c.isActive).length})`} />
        <Tab label={`Pasif Müşteriler (${clients.filter(c => !c.isActive).length})`} />
      </Tabs>
      
      {/* Müşteri Tablosu */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Müşteri Listesi</Typography>
        </Box>
                <TableCell>E-posta</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Sektör</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={client.logo || undefined} 
                            sx={{ mr: 2, bgcolor: client.isActive ? 'primary.main' : 'grey.500' }}
                          >
                            {client.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">{client.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={client.sector} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={client.isActive ? 'Aktif' : 'Pasif'} 
                          size="small" 
                          color={client.isActive ? 'success' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(client)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ödeme Bilgileri">
                          <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => handleOpenPaymentDialog(client)}
                          >
                            <MonetizationOnIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={client.isActive ? 'Pasife Al' : 'Aktife Al'}>
                          <IconButton 
                            size="small" 
                            color={client.isActive ? 'default' : 'success'} 
                            onClick={() => handleToggleStatus(client)}
                          >
                            {client.isActive ? 
                              <VisibilityOffIcon fontSize="small" /> : 
                              <VisibilityIcon fontSize="small" />
                            }
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(client.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {clients.length === 0 ? 
                        'Henüz müşteri kaydı bulunmuyor. Yeni müşteri ekleyin.' : 
                        'Arama kriterlerine uygun müşteri bulunamadı.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredClients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Müşteri Ekleme/Düzenleme Diyaloğu */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editMode ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Firma Adı"
                fullWidth
                required
                value={newClient.name}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="contactPerson"
                label="İletişim Kişisi"
                fullWidth
                required
                value={newClient.contactPerson}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="E-posta"
                type="email"
                fullWidth
                required
                value={newClient.email}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Telefon"
                fullWidth
                required
                value={newClient.phone}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="sector"
                select
                label="Sektör"
                fullWidth
                required
                value={newClient.sector}
                onChange={handleFormChange}
                margin="normal"
              >
                {SECTORS.map(sector => (
                  <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="taxNumber"
                label="Vergi Numarası"
                fullWidth
                value={newClient.taxNumber}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Adres"
                fullWidth
                multiline
                rows={2}
                value={newClient.address}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="website"
                label="Web Sitesi"
                fullWidth
                value={newClient.website}
                onChange={handleFormChange}
                margin="normal"
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="logo"
                label="Logo URL"
                fullWidth
                value={newClient.logo}
                onChange={handleFormChange}
                margin="normal"
                placeholder="https://example.com/logo.png"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="monthlyIncome"
                label="Aylık Gelir (TL)"
                type="number"
                fullWidth
                value={newClient.monthlyIncome}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₺
                    </InputAdornment>
                  )
                }}
                helperText="Müşteriden aylık olarak tahsil edilen tutar"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                name="paymentStatus"
                label="Ödeme Durumu"
                fullWidth
                value={newClient.paymentStatus}
                onChange={handleFormChange}
                margin="normal"
                helperText="Müşterinin ödeme durumu"
              >
                <MenuItem value="none">Ödeme Yok</MenuItem>
                <MenuItem value="paid">Ödendi</MenuItem>
                <MenuItem value="pending">Beklemede</MenuItem>
                <MenuItem value="overdue">Gecikmiş</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notlar"
                fullWidth
                multiline
                rows={3}
                value={newClient.notes}
                onChange={handleFormChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={newClient.isActive}
                    onChange={handleFormChange}
                    color="primary"
                  />
                }
                label="Aktif Müşteri"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            İptal
          </Button>
          <Button onClick={handleSaveClient} color="primary" variant="contained">
            {editMode ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme Onay Diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Müşteri Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ödeme Bilgileri Diyaloğu */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MonetizationOnIcon sx={{ mr: 1, color: 'info.main' }} />
            Ödeme Bilgileri
          </Box>
        </DialogTitle>
        <DialogContent>
          {clientToUpdatePayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {clientToUpdatePayment.name}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Aylık Tahsilat Tutarı (TL)"
                    type="number"
                    fullWidth
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₺
                        </InputAdornment>
                      )
                    }}
                    helperText="Müşteriden aylık olarak tahsil edilen tutar"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Ödeme Durumu"
                    fullWidth
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'pending' | 'overdue' | 'none')}
                  >
                    <MenuItem value="none">Ödeme Yok</MenuItem>
                    <MenuItem value="paid">Ödendi</MenuItem>
                    <MenuItem value="pending">Beklemede</MenuItem>
                    <MenuItem value="overdue">Gecikmiş</MenuItem>
                  </TextField>
                </Grid>
                
                {clientToUpdatePayment.lastPaymentDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Son Ödeme Tarihi: {formatDate(clientToUpdatePayment.lastPaymentDate)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleSavePayment} 
            color="primary" 
            variant="contained"
            startIcon={<PaymentIcon />}
          >
            Ödeme Bilgilerini Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientsPage;
