import React, { useState, useEffect, ReactElement, JSXElementConstructor } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: SxProps<Theme>;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination as MuiTablePagination,
  TablePaginationProps as MuiTablePaginationProps,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PriorityHigh as PriorityHighIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Block as BlockIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { 
  Client, 
  SECTORS,
  CLIENTS_UPDATED_EVENT,
  addClient, 
  updateClient, 
  deleteClient,
  PaymentStatus,
  getAllClients,
  toggleClientStatus,
  createDemoClients,
  saveClientsToStorage
} from '../services/ClientService';

// Ödeme durumu için yardımcı fonksiyonlar

// Tahsilat durumu etiketlerini getir
const getPaymentStatusLabel = (status: PaymentStatus = 'none'): string => {
  switch (status) {
    case 'paid':
      return 'Ödendi';
    case 'partial':
      return 'Kısmi Ödeme';
    case 'overdue':
      return 'Gecikmiş';
    case 'none':
    default:
      return 'Bekliyor';
  }
};

// Tahsilat durumu renklerini getir
const getPaymentStatusColor = (status?: Client['paymentStatus']): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial':
      return 'warning';
    case 'overdue':
      return 'error';
    case 'none':
    default:
      return 'default';
  }
};

// Tahsilat durumu ikonlarını getir
const getPaymentStatusIcon = (status?: Client['paymentStatus']): ReactElement | undefined => {
  switch (status) {
    case 'paid':
      return <CheckCircleIcon fontSize="small" />;
    case 'partial':
      return <HourglassEmptyIcon fontSize="small" />;
    case 'overdue':
      return <PriorityHighIcon fontSize="small" />;
    case 'none':
    default:
      return <BlockIcon fontSize="small" />;
  }
};

const ClientsPage: React.FC = () => {
  // State tanımlamaları
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tabValue, setTabValue] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [clientToUpdate, setClientToUpdate] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('none' as PaymentStatus);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    sector: 'Diğer',
    taxNumber: '',
    website: '',
    notes: '',
    isActive: true,
    monthlyIncome: 0,
    paymentStatus: 'none' as PaymentStatus
  });
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' | 'info' | 'warning' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

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
      // Tüm müşterileri getir
      const allClients = getAllClients();
      setClients(allClients);
      
      // Filtreleri uygula
      applyFilters(searchQuery, filterSector, filterStatus);
      
      console.log(`[${new Date().toISOString()}] ${allClients.length} müşteri yüklendi`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Müşteriler yüklenirken hata oluştu:`, error);
      setSnackbar({
        open: true,
        message: 'Müşteriler yüklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  // Örnek müşteri verilerini geri yükle
  const restoreClientData = () => {
    try {
      // Örnek müşteri verilerini oluştur
      const demoClients = createDemoClients();
      
      // LocalStorage'a kaydet
      saveClientsToStorage(demoClients);
      
      // Müşterileri yeniden yükle
      loadClients();
      
      setSnackbar({
        open: true,
        message: 'Örnek müşteri verileri başarıyla yüklendi.',
        severity: 'success'
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Müşteri verileri geri yüklenirken hata oluştu:`, error);
      setSnackbar({
        open: true,
        message: 'Müşteri verileri geri yüklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  // Filtreleri uygula
  const applyFilters = (query: string, sector: string, status: string) => {
    let filtered = [...clients];
    
    // Arama sorgusu filtresi
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.contactPerson.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.address.toLowerCase().includes(searchLower) ||
        client.sector.toLowerCase().includes(searchLower)
      );
    }
    
    // Sektör filtresi
    if (sector && sector !== 'all') {
      filtered = filtered.filter(client => client.sector === sector);
    }
    
    // Durum filtresi
    if (status === 'active') {
      filtered = filtered.filter(client => client.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(client => !client.isActive);
    }
    
    setFilteredClients(filtered);
    setPage(0); // Filtre değiştiğinde ilk sayfaya dön
  };

  // Sayfalama işlevleri
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Type-safe TablePagination component
  const TablePagination = (props: MuiTablePaginationProps) => (
    <MuiTablePagination
      component="div"
      {...props}
      rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
      count={filteredClients.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      labelDisplayedRows={({ from, to, count }) => 
        `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
      }
    />
  );

  // Tab değişimi
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Tab değiştiğinde filtreleri güncelle
    if (newValue === 0) {
      setFilterStatus('all');
    } else if (newValue === 1) {
      setFilterStatus('active');
    } else if (newValue === 2) {
      setFilterStatus('inactive');
    }
    
    applyFilters(searchQuery, filterSector, 
      newValue === 0 ? 'all' : newValue === 1 ? 'active' : 'inactive'
    );
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

  // Müşteri silme dialogunu aç
  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  // Müşteri silme işlemini onayla
  const confirmDeleteClient = () => {
    if (clientToDelete) {
      try {
        // Müşteriyi sil
        const success = deleteClient(clientToDelete);
        
        if (success) {
          // Müşterileri yeniden yükle
          loadClients();
          
          setSnackbar({
            open: true,
            message: 'Müşteri başarıyla silindi.',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Müşteri silinirken bir hata oluştu.',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Müşteri silinirken hata oluştu:`, error);
        setSnackbar({
          open: true,
          message: 'Müşteri silinirken bir hata oluştu.',
          severity: 'error'
        });
      }
    }
    
    // Dialog'u kapat ve geçici state'i temizle
    setDeleteDialogOpen(false);
    setClientToDelete('');
  };

  // Silme işlemini iptal et
  const cancelDeleteClient = () => {
    setDeleteDialogOpen(false);
    setClientToDelete('');
  };

  // Müşteri durumunu değiştir (aktif/pasif)
  const handleToggleStatus = (clientId: string, currentStatus: boolean) => {
    try {
      // Müşteriyi bul
      const clientToUpdate = clients.find(client => client.id === clientId);
      if (!clientToUpdate) {
        throw new Error('Müşteri bulunamadı');
      }

      // Müşteri durumunu güncelle
      const updatedClient = {
        ...clientToUpdate,
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      };

      // Müşteriyi güncelle
      const result = updateClient(updatedClient);
      
      if (result) {
        // Müşteri listesini güncelle
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === clientId ? updatedClient : client
          )
        );
        
        // Başarı mesajını göster
        setSnackbar({
          open: true,
          message: `Müşteri başarıyla ${!currentStatus ? 'aktif' : 'pasif'} duruma getirildi.`,
          severity: 'success' as const
        });
      }
    } catch (error) {
      console.error('Müşteri durumu değiştirilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri durumu değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error' as const
      });
    }
  };

  // Tahsilat durumu dialogunu aç
  const handleUpdatePaymentStatus = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientToUpdate(clientId);
      setNewPaymentStatus(client.paymentStatus || 'none');
      setPaymentDialogOpen(true);
    }
  };

  // Tahsilat durumu güncelleme işlemini onayla
  const confirmUpdatePaymentStatus = () => {
    if (clientToUpdate && newPaymentStatus) {
      try {
        // Müşteriyi bul
        const clientIndex = clients.findIndex(c => c.id === clientToUpdate);
        if (clientIndex >= 0) {
          // Müşteri bilgilerini güncelle
          const updatedClient = {
            ...clients[clientIndex],
            paymentStatus: newPaymentStatus as PaymentStatus,
            lastPaymentDate: newPaymentStatus === 'paid' ? new Date().toISOString() : clients[clientIndex].lastPaymentDate,
            updatedAt: new Date().toISOString()
          };
          
          // Müşteriyi güncelle
          const result = updateClient(updatedClient);
          
          if (result) {
            // Müşterileri yeniden yükle
            loadClients();
            
            setSnackbar({
              open: true,
              message: 'Tahsilat durumu başarıyla güncellendi.',
              severity: 'success' as const
            });
          } else {
            setSnackbar({
              open: true,
              message: 'Tahsilat durumu güncellenirken bir hata oluştu.',
              severity: 'error' as const
            });
          }
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Tahsilat durumu güncellenirken hata oluştu:`, error);
        setSnackbar({
          open: true,
          message: 'Tahsilat durumu güncellenirken bir hata oluştu.',
          severity: 'error' as const
        });
      }
    }
    
    // Dialog'u kapat ve geçici state'i temizle
    setPaymentDialogOpen(false);
    setClientToUpdate('');
    setNewPaymentStatus('none');
  };

  // Tahsilat durumu güncelleme işlemini iptal et
  const cancelUpdatePaymentStatus = () => {
    setPaymentDialogOpen(false);
    setClientToUpdate('');
    setNewPaymentStatus('none');
  };

  // Yeni müşteri ekleme işlemi
  const handleAddClient = async () => {
    if (!newClient) return;

    try {
      // Zorunlu alanları kontrol et
      if (!newClient.name.trim() || !newClient.email.trim()) {
        setSnackbar({
          open: true,
          message: 'Lütfen zorunlu alanları doldurunuz.',
          severity: 'error' as const
        });
        return;
      }

      // Geçerli bir PaymentStatus değeri belirle
      const validPaymentStatus: PaymentStatus = (
        newClient.paymentStatus === 'paid' || 
        newClient.paymentStatus === 'partial' || 
        newClient.paymentStatus === 'overdue' ||
        newClient.paymentStatus === 'none'
      ) ? newClient.paymentStatus : 'none';

      const clientToAdd = {
        ...newClient,
        name: newClient.name.trim(),
        email: newClient.email.trim(),
        phone: newClient.phone.trim(),
        address: newClient.address.trim(),
        sector: newClient.sector.trim(),
        contactPerson: newClient.contactPerson.trim(),
        taxNumber: newClient.taxNumber?.trim() || '',
        website: newClient.website?.trim() || '',
        notes: newClient.notes?.trim() || '',
        isActive: newClient.isActive,
        paymentStatus: validPaymentStatus,
        monthlyIncome: Number(newClient.monthlyIncome) || 0,
        lastPaymentDate: newClient.lastPaymentDate || '',
      };

      const addedClient = await addClient(clientToAdd);

      if (addedClient) {
        // Müşteri listesini güncelle
        setClients(prevClients => [...prevClients, addedClient]);
        
        // Formu sıfırla ve dialogu kapat
        setNewClient({
          name: '',
          email: '',
          phone: '',
          address: '',
          sector: 'Diğer',
          contactPerson: '',
          taxNumber: '',
          website: '',
          notes: '',
          isActive: true,
          paymentStatus: 'none',
          monthlyIncome: 0,
          lastPaymentDate: ''
        });
        setAddDialogOpen(false);
        
        // Başarılı mesajı göster
        setSnackbar({
          open: true,
          message: 'Müşteri başarıyla eklendi.',
          severity: 'success' as const
        });
      }
    } catch (error) {
      console.error('Müşteri eklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri eklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error' as const
      });
    }
  };

  // Müşteri düzenleme işlemi
  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setEditDialogOpen(true);
  };

    // Müşteri güncelleme işlevi
  const handleUpdateClient = async () => {
    if (!currentClient) return;

    try {
      // Ensure paymentStatus is a valid PaymentStatus value
      const validPaymentStatus: PaymentStatus = 
        (currentClient.paymentStatus === 'paid' || 
         currentClient.paymentStatus === 'partial' || 
         currentClient.paymentStatus === 'overdue') 
          ? currentClient.paymentStatus 
          : 'none';

      const clientToUpdate: Client = {
        ...currentClient,
        paymentStatus: validPaymentStatus,
        updatedAt: new Date().toISOString(),
        // Ensure required fields are present
        name: currentClient.name || '',
        contactPerson: currentClient.contactPerson || '',
        email: currentClient.email || '',
        phone: currentClient.phone || '',
        address: currentClient.address || '',
        sector: currentClient.sector || 'Diğer',
        isActive: currentClient.isActive !== undefined ? currentClient.isActive : true,
        createdAt: currentClient.createdAt || new Date().toISOString()
      };

      const updatedClient = await updateClient(clientToUpdate);

      if (updatedClient) {
        // Müşterileri güncelle
        setClients(prevClients => 
          prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
        );
        
        // Başarılı mesajı göster
        setSnackbar({
          open: true,
          message: 'Müşteri başarıyla güncellendi.',
          severity: 'success' as const
        });
        
        // Formu kapat ve temizle
        setEditDialogOpen(false);
        setCurrentClient(null);
      } else {
        // Hata mesajı göster
        setSnackbar({
          open: true,
          message: 'Müşteri güncellenirken bir hata oluştu. Lütfen bilgileri kontrol edin.',
          severity: 'error' as const
        });
      }
    } catch (error) {
      console.error('Müşteri güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error'
      });
    }
  };

  // Müşteri ekleme formu değişikliklerini işle
  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Müşteri Yönetimi
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Yeni Müşteri Ekle
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 3, p: 2 }}>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Müşteri Listesi
          </Typography>
        </Box>
        
        {/* Arama ve Filtre */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Müşteri Ara"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              placeholder="İsim, e-posta, telefon veya adres ile ara..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Sektöre Göre Filtrele"
              variant="outlined"
              value={filterSector}
              onChange={handleSectorFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="all">Tüm Sektörler</MenuItem>
              {SECTORS.map(sector => (
                <MenuItem key={sector} value={sector}>{sector}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Müşteri Adı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Sektör</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tahsilat Durumu</TableCell>
                <TableCell>Son Güncelleme</TableCell>
                <TableCell align="right">Aksiyonlar</TableCell>
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
                      <TableCell>
                        <Chip 
                          label={getPaymentStatusLabel(client.paymentStatus)} 
                          size="small" 
                          color={getPaymentStatusColor(client.paymentStatus)}
                          icon={getPaymentStatusIcon(client.paymentStatus) || undefined}
                        />
                      </TableCell>
                      <TableCell>{formatDate(client.updatedAt || client.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Müşteri Bilgilerini Düzenle">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditClient(client)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tahsilat Durumunu Güncelle">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleUpdatePaymentStatus(client.id)}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={client.isActive ? 'Müşteriyi Pasife Al' : 'Müşteriyi Aktif Yap'}>
                            <IconButton 
                              size="small" 
                              color={client.isActive ? 'warning' : 'success'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(client.id, client.isActive);
                              }}
                            >
                              {client.isActive ? 
                                <BlockIcon fontSize="small" /> : 
                                <CheckCircleIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Müşteriyi Sil">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClient(client.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
      
      {/* Müşteri Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteClient}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Müşteriyi Sil
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="delete-dialog-description">
            Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteClient} color="primary">
            İptal
          </Button>
          <Button onClick={confirmDeleteClient} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tahsilat Durumu Güncelleme Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={cancelUpdatePaymentStatus}
        aria-labelledby="payment-dialog-title"
        aria-describedby="payment-dialog-description"
      >
        <DialogTitle id="payment-dialog-title">
          Tahsilat Durumunu Güncelle
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="payment-status-select-label">Tahsilat Durumu</InputLabel>
            <Select
              labelId="payment-status-select-label"
              id="payment-status-select"
              value={newPaymentStatus}
              label="Tahsilat Durumu"
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
            >
              <MenuItem value="paid">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                  Ödendi
                </Box>
              </MenuItem>
              <MenuItem value="pending">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HourglassEmptyIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                  Beklemede
                </Box>
              </MenuItem>
              <MenuItem value="overdue">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PriorityHighIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                  Gecikmiş
                </Box>
              </MenuItem>
              <MenuItem value="none">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BlockIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} />
                  Tanımlanmadı
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUpdatePaymentStatus} color="primary">
            İptal
          </Button>
          <Button onClick={confirmUpdatePaymentStatus} color="primary" variant="contained" autoFocus>
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Müşteri Ekleme Dialogu */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Müşteri Adı *"
                name="name"
                value={newClient.name}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yetkili Kişi"
                name="contactPerson"
                value={newClient.contactPerson}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta *"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={newClient.phone}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="address"
                value={newClient.address}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Sektör"
                name="sector"
                value={newClient.sector}
                onChange={handleNewClientChange}
                margin="normal"
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vergi Numarası"
                name="taxNumber"
                value={newClient.taxNumber}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Web Sitesi"
                name="website"
                value={newClient.website}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Aylık Gelir (TL)"
                name="monthlyIncome"
                type="number"
                value={newClient.monthlyIncome}
                onChange={handleNewClientChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                name="notes"
                value={newClient.notes}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newClient.isActive}
                    onChange={(e) => setNewClient({ ...newClient, isActive: e.target.checked })}
                    name="isActive"
                    color="primary"
                  />
                }
                label={newClient.isActive ? 'Aktif Müşteri' : 'Pasif Müşteri'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleAddClient} 
            color="primary" 
            variant="contained"
            disabled={!newClient.name || !newClient.email}
          >
            Müşteri Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Müşteri Düzenleme Diyaloğu */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Müşteri Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Müşteri Adı *"
                name="name"
                value={newClient.name}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yetkili Kişi"
                name="contactPerson"
                value={newClient.contactPerson}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta *"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={newClient.phone}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="address"
                value={newClient.address}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Sektör"
                name="sector"
                value={newClient.sector}
                onChange={handleNewClientChange}
                margin="normal"
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vergi Numarası"
                name="taxNumber"
                value={newClient.taxNumber}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Web Sitesi"
                name="website"
                value={newClient.website}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Aylık Gelir (TL)"
                name="monthlyIncome"
                type="number"
                value={newClient.monthlyIncome}
                onChange={handleNewClientChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                name="notes"
                value={newClient.notes}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newClient.isActive}
                    onChange={(e) => setNewClient({ ...newClient, isActive: e.target.checked })}
                    name="isActive"
                    color="primary"
                  />
                }
                label={newClient.isActive ? 'Aktif Müşteri' : 'Pasif Müşteri'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tahsilat Durumu</InputLabel>
                <Select
                  value={newClient.paymentStatus}
                  onChange={(e) => setNewClient({ ...newClient, paymentStatus: e.target.value as PaymentStatus })}
                  label="Tahsilat Durumu"
                >
                  <MenuItem value="none">Beklemede</MenuItem>
                  <MenuItem value="partial">Kısmi Ödendi</MenuItem>
                  <MenuItem value="paid">Ödendi</MenuItem>
                  <MenuItem value="overdue">Gecikmiş</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleUpdateClient} 
            color="primary" 
            variant="contained"
            disabled={!newClient.name || !newClient.email}
          >
            Değişiklikleri Kaydet
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
