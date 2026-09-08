package com.billingapp.service;

import com.billingapp.model.*;
import com.billingapp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceTemplateRepository templateRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           BusinessRepository businessRepository,
                           CustomerRepository customerRepository,
                           ProductRepository productRepository,
                           InvoiceRepository invoiceRepository,
                           InvoiceTemplateRepository templateRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.templateRepository = templateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure default Platform Administrator
        User user = userRepository.findByUsername("admin").orElseGet(() -> {
            User newUser = new User(
                    "admin",
                    "admin@smartbilling.com",
                    passwordEncoder.encode("admin123"),
                    "Admin Administrator"
            );
            newUser.setRole("ROLE_ADMIN");
            return userRepository.save(newUser);
        });
        if (!"ROLE_ADMIN".equals(user.getRole())) {
            user.setRole("ROLE_ADMIN");
            userRepository.save(user);
        }

        // 2. Ensure default Business
        List<Business> businesses = businessRepository.findAll();
        Business business;
        if (businesses.isEmpty()) {
            business = new Business();
            business.setName("Apex Architectural Solutions");
            business.setLogo("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
            business.setAddress("Plot 42, Tech Park Avenue, Hitech City, Hyderabad, 500081");
            business.setGstin("36AAAAA0000A1Z5");
            business.setPhone("+91 98765 43210");
            business.setEmail("billing@apexarchitectural.com");
            business.setWebsite("www.apexarchitectural.com");
            business.setCurrency("₹");
            business.setBankName("HDFC Bank Ltd");
            business.setAccountNumber("50200012345678");
            business.setIfscCode("HDFC0001234");
            business.setUpiId("apexsolutions@hdfcbank");
            business.setTaxPercentage(18.0);
            business.setInvoicePrefix("APX");
            business.setInvoiceTerms("1. Payment is due within 15 days of invoice date.\n2. Interest @ 1.5% per month will be charged on late payments.\n3. Goods once sold will not be taken back.");
            business.setNotes("Thank you for choosing Apex Architectural Solutions!");
            business.setOwner(user);
            business = businessRepository.save(business);
        } else {
            business = businesses.get(0);
            if (business.getOwner() == null) {
                business.setOwner(user);
                if (business.getCurrency() == null) business.setCurrency("₹");
                if (business.getTaxPercentage() == null) business.setTaxPercentage(18.0);
                if (business.getInvoicePrefix() == null) business.setInvoicePrefix("INV");
                businessRepository.save(business);
            }
        }

        // 3. Ensure Sample Customers
        if (customerRepository.countByBusinessId(business.getId()) == 0) {
            Customer c1 = new Customer(
                    "Rajesh Sharma",
                    "rajesh.sharma@gmail.com",
                    "9876501234",
                    "Sharma Builders & Promoters",
                    "Suite 302, Green Valley Towers, Banjara Hills, Hyderabad",
                    "36AABCS1234F1Z1",
                    business
            );
            Customer c2 = new Customer(
                    "Priya Patel",
                    "priya@innovatetech.in",
                    "9123456780",
                    "Innovate Interior Studios",
                    "Road No 10, Jubilee Hills, Hyderabad",
                    "36AABCI5678G1Z2",
                    business
            );
            customerRepository.saveAll(List.of(c1, c2));
        }

        // 4. Ensure Sample Products
        if (productRepository.countByBusinessId(business.getId()) == 0) {
            Product p1 = new Product("UPVC Sliding Window Frame", "Standard 2-track sliding window profile", "3925", "sqft", 280.0, 18.0, business);
            Product p2 = new Product("Toughened Float Glass 5mm", "Clear tempered safety glass for facade/windows", "7007", "sqft", 140.0, 18.0, business);
            Product p3 = new Product("Structural Weather Silicone Sealant", "Dow Corning 789 black silicone tube", "3214", "pcs", 350.0, 18.0, business);
            Product p4 = new Product("Aluminum Louver Louvers", "Powder coated aluminum architectural louvers", "7610", "meter", 520.0, 18.0, business);
            Product p5 = new Product("Installation & Glazing Labor", "Site fitting, alignment and silicone sealing services", "9954", "sqft", 65.0, 18.0, business);
            productRepository.saveAll(List.of(p1, p2, p3, p4, p5));
        }

        // 5. Ensure Default Template
        if (templateRepository.findByBusinessId(business.getId()).isEmpty()) {
            InvoiceTemplate template = new InvoiceTemplate();
            template.setTemplateName("Modern Professional");
            template.setTheme("modern");
            template.setPrimaryColor("#0d6efd");
            template.setShowLogo(true);
            template.setShowBusinessName(true);
            template.setShowAddress(true);
            template.setShowGstin(true);
            template.setShowPhone(true);
            template.setShowEmail(true);
            template.setShowWebsite(true);
            template.setShowCustomerName(true);
            template.setShowCustomerPhone(true);
            template.setShowCustomerAddress(true);
            template.setShowProduct(true);
            template.setShowQuantity(true);
            template.setShowRate(true);
            template.setShowAmount(true);
            template.setShowTotal(true);
            template.setShowTaxBreakdown(true);
            template.setShowBankDetails(true);
            template.setShowSignature(true);
            template.setBusiness(business);
            templateRepository.save(template);
        }

        // 6. Ensure Sample Invoices
        if (invoiceRepository.countByBusinessId(business.getId()) == 0) {
            Invoice inv1 = new Invoice();
            inv1.setInvoiceNumber("APX-2026-0001");
            inv1.setBusiness(business);
            inv1.setCustomerName("Sharma Builders & Promoters");
            inv1.setCustomerPhone("9876501234");
            inv1.setCustomerEmail("rajesh.sharma@gmail.com");
            inv1.setCustomerAddress("Suite 302, Green Valley Towers, Banjara Hills, Hyderabad");
            inv1.setCustomerGstin("36AABCS1234F1Z1");
            inv1.setInvoiceDate(LocalDate.now().minusDays(5));
            inv1.setDueDate(LocalDate.now().plusDays(10));
            inv1.setStatus("PAID");
            inv1.setCurrency("₹");
            inv1.setTemplateTheme("modern");
            inv1.setNotes("Delivered and fitted at Banjara Hills site.");
            inv1.setTerms(business.getInvoiceTerms());
            inv1.setPaymentMethod("Bank Transfer");

            InvoiceItem itm1 = new InvoiceItem("UPVC Sliding Window Frame", "Dimensions: 6ft x 4ft", 1, 280, 0);
            itm1.setWidth(6.0);
            itm1.setHeight(4.0);
            itm1.setNosSft(2.0);
            itm1.setRate(280.0);
            itm1.setAmount(13440.0); // 6*4*2*280 = 13440
            itm1.setUnit("sqft");

            InvoiceItem itm2 = new InvoiceItem("Toughened Float Glass 5mm", "Glass panels for sliding frame", 1, 140, 0);
            itm2.setWidth(6.0);
            itm2.setHeight(4.0);
            itm2.setNosSft(2.0);
            itm2.setRate(140.0);
            itm2.setAmount(6720.0);
            itm2.setUnit("sqft");

            InvoiceItem itm3 = new InvoiceItem("Structural Weather Silicone Sealant", "4 tubes silicone", 4, 350, 1400.0);
            itm3.setQuantity(4.0);
            itm3.setRate(350.0);
            itm3.setAmount(1400.0);
            itm3.setUnit("pcs");

            inv1.addItem(itm1);
            inv1.addItem(itm2);
            inv1.addItem(itm3);

            double subtotal = 13440.0 + 6720.0 + 1400.0; // 21560.0
            inv1.setSubtotal(subtotal);
            inv1.setTaxRate(18.0);
            double tax = (subtotal * 18.0) / 100.0; // 3880.80
            inv1.setTaxAmount(tax);
            inv1.setDiscountAmount(560.0);
            double total = (subtotal - 560.0) + ((subtotal - 560.0) * 0.18);
            inv1.setTotalAmount(Math.round(total * 100.0) / 100.0);
            inv1.setPaidAmount(inv1.getTotalAmount());

            invoiceRepository.save(inv1);

            // Sample 2: Pending invoice
            Invoice inv2 = new Invoice();
            inv2.setInvoiceNumber("APX-2026-0002");
            inv2.setBusiness(business);
            inv2.setCustomerName("Innovate Interior Studios");
            inv2.setCustomerPhone("9123456780");
            inv2.setCustomerEmail("priya@innovatetech.in");
            inv2.setCustomerAddress("Road No 10, Jubilee Hills, Hyderabad");
            inv2.setInvoiceDate(LocalDate.now());
            inv2.setDueDate(LocalDate.now().plusDays(15));
            inv2.setStatus("SENT");
            inv2.setCurrency("₹");
            inv2.setTemplateTheme("modern");
            inv2.setTerms(business.getInvoiceTerms());

            InvoiceItem itm4 = new InvoiceItem("Aluminum Louver Louvers", "Balcony louvers", 15, 520, 7800.0);
            itm4.setQuantity(15.0);
            itm4.setRate(520.0);
            itm4.setAmount(7800.0);
            itm4.setUnit("meter");

            inv2.addItem(itm4);
            inv2.setSubtotal(7800.0);
            inv2.setTaxRate(18.0);
            inv2.setTaxAmount(1404.0);
            inv2.setTotalAmount(9204.0);

            invoiceRepository.save(inv2);
        }
    }
}
